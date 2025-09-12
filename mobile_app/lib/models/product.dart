// lib/models/product.dart
class Product {
  final String id;
  final String name;
  final String sku;
  final int quantityOnHand;

  Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.quantityOnHand,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      sku: json['sku'],
      quantityOnHand: json['quantity_on_hand'],
    );
  }
}