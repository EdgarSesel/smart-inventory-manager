// lib/models/product.dart
class Product {
  final String id;
  final String name;
  final String sku;
  final int quantityOnHand;
  // --- ADD THESE TWO MISSING FIELDS ---
  final String? description;
  final int reorderPoint;

  Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.quantityOnHand,
    this.description,
    required this.reorderPoint,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      sku: json['sku'],
      quantityOnHand: json['quantity_on_hand'],
      // --- ADD THE PARSING LOGIC ---
      description: json['description'],
      reorderPoint: json['reorder_point'],
    );
  }
}