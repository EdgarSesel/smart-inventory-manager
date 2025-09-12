from sqlalchemy.orm import Session
from models import product as product_model, inventory as inventory_model
import uuid
import pandas as pd
from prophet import Prophet
from sklearn.ensemble import IsolationForest


def get_dashboard_kpis(db: Session):
    total_products = db.query(product_model.Product).count()

    low_stock_items = db.query(product_model.Product).filter(
        product_model.Product.quantity_on_hand < product_model.Product.reorder_point
    ).count()

    return {"total_products": total_products, "low_stock_items": low_stock_items}

def get_product_historical_data(db: Session, product_id: uuid.UUID):
    movements = db.query(inventory_model.InventoryMovement).filter(
        inventory_model.InventoryMovement.product_id == product_id,
        # ONLY FETCH COMPLETED
        inventory_model.InventoryMovement.status == 'COMPLETED'
    ).order_by(inventory_model.InventoryMovement.created_at.asc()).all()

    # Format the data for the chart
    return [
        {"timestamp": move.created_at, "quantity": move.new_quantity_on_hand}
        for move in movements
    ]

def get_product_demand_forecast(db: Session, product_id: uuid.UUID):
    try:
        sales_movements = db.query(inventory_model.InventoryMovement).filter(
            inventory_model.InventoryMovement.product_id == product_id,
            inventory_model.InventoryMovement.change_quantity < 0
        ).order_by(inventory_model.InventoryMovement.created_at.asc()).all()

        if len(sales_movements) < 2:
            return []

        # Prophet needs a DataFrame with 'ds' (datestamp) and 'y' (value)
        history_df = pd.DataFrame([
            {'ds': move.created_at, 'y': abs(move.change_quantity)}
            for move in sales_movements
        ])

        # Ensure 'ds' is timezone-naive for Prophet
        history_df['ds'] = pd.to_datetime(history_df['ds']).dt.tz_localize(None)

        model = Prophet()
        model.fit(history_df)
        
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)
        
        return [
            {'timestamp': row['ds'], 'quantity': round(row['yhat'])}
            for index, row in forecast.iterrows() if row['yhat'] >= 0
        ]
    except Exception as e:
        print(f"Prophet forecasting failed: {e}")
        return []
    
    
def get_product_scheduled_data(db: Session, product_id: uuid.UUID):
    movements = db.query(inventory_model.InventoryMovement).filter(
        inventory_model.InventoryMovement.product_id == product_id,
        # ONLY FETCH SCHEDULED
        inventory_model.InventoryMovement.status == 'SCHEDULED'
    ).order_by(inventory_model.InventoryMovement.created_at.asc()).all()
    return [
        {"timestamp": move.created_at, "quantity": move.new_quantity_on_hand}
        for move in movements
    ]

def _find_anomalies_in_movements(movements: list):
    """Helper function that takes a list of movement objects and returns the anomalous ones."""
    if len(movements) < 10:
        return []

    df_for_model = pd.DataFrame([
        {
            'change_quantity': move.change_quantity,
            'hour_of_day': move.created_at.hour,
            'day_of_week': move.created_at.weekday(),
        } for move in movements
    ])
    features = ['change_quantity', 'hour_of_day', 'day_of_week']
    model = IsolationForest(contamination='auto', random_state=42)
    predictions = model.fit_predict(df_for_model[features])
    anomalies = [movements[i] for i, pred in enumerate(predictions) if pred == -1]
    return anomalies

# --- These two functions perform the data transformation ---
def get_anomalous_movements(db: Session):
    # This query now JOINS the two tables to get the product name
    movements = db.query(
        inventory_model.InventoryMovement, product_model.Product.name
    ).join(
        product_model.Product, inventory_model.InventoryMovement.product_id == product_model.Product.id
    ).order_by(inventory_model.InventoryMovement.created_at.desc()).all()

    # The movements list now contains tuples: (movement_object, product_name)
    all_movement_objects = [move[0] for move in movements]
    anomalous_movement_objects = _find_anomalies_in_movements(all_movement_objects)
    
    # Create a mapping for easy lookup
    movement_to_name_map = {move[0].id: move[1] for move in movements}

    # Manually build the response with the simple string date
    return [
        {
            "id": move.id, "product_id": move.product_id,
            "product_name": movement_to_name_map.get(move.id, "Unknown"),
            "change_quantity": move.change_quantity, "reason": move.reason,
            "event_date": move.created_at.strftime('%Y-%m-%d %H:%M')
        }
        for move in anomalous_movement_objects
    ]

def get_anomalies_for_product(db: Session, product_id: uuid.UUID):
    movements = db.query(inventory_model.InventoryMovement).filter(
        inventory_model.InventoryMovement.product_id == product_id
    ).order_by(inventory_model.InventoryMovement.created_at.desc()).all()
    
    anomalous_movements = _find_anomalies_in_movements(movements)
    
    # Manually build the response here as well
    product_name = db.query(product_model.Product.name).filter(product_model.Product.id == product_id).scalar()
    return [
        {
            "id": move.id, "product_id": move.product_id,
            "product_name": product_name,
            "change_quantity": move.change_quantity, "reason": move.reason,
            "event_date": move.created_at.strftime('%Y-%m-%d %H:%M')
        }
        for move in anomalous_movements
    ]