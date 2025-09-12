import React, { useState } from 'react';
import Modal from 'react-modal';
import { updateInventory } from '../services/api';

Modal.setAppElement('#root'); // For accessibility

// Define the custom styles for the modal's position and overlay
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
  },
};

const InventoryModal = ({ isOpen, onClose, product, onSuccess }) => {
  // We use string state for inputs to avoid issues with empty fields
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Shipment Received');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const changeQuantity =
      reason === 'Sale' ? -Math.abs(parseInt(quantity)) : parseInt(quantity);
      
    if (isNaN(changeQuantity) || changeQuantity === 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {
      // CAPTURE THE RETURNED DATA
      const updatedProduct = await updateInventory(product.id, changeQuantity, reason);
      setQuantity('');
      // PASS THE DATA TO THE PARENT COMPONENT
      onSuccess(updatedProduct); 
    } catch (error) {
      alert('Failed to update inventory.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Update Inventory Modal"
    >
      <form onSubmit={handleSubmit} className="modal-content">
        <h2>Update Stock for {product?.name}</h2>
        <p>Current Quantity: {product?.quantity_on_hand}</p>

        <div className="input-group">
          <label htmlFor="quantity">Quantity Change</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 50 for incoming, 10 for sale"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="reason">Reason</label>
          <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Shipment Received">Shipment Received (+)</option>
            <option value="Sale">Sale (-)</option>
            <option value="Correction">Correction (+/-)</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit-btn">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryModal;