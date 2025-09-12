// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/models/product.dart';

class ApiService {
  // IMPORTANT: Use your correct IP address here
  final String _baseUrl = 'http://10.0.2.2:8000';

  // Helper to get the auth token
  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');
    if (token == null) throw Exception('Not authenticated');
    return token;
  }

  Future<void> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/login/token');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'username': email, 'password': password},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final token = data['access_token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('authToken', token);
    } else {
      throw Exception('Failed to log in');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
  }

  Future<List<Product>> getProducts() async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/');
    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => Product.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  // --- NEW FUNCTIONS FOR STOCK UPDATE ---

  Future<Product> findProductBySku(String sku) async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/sku/$sku');
    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return Product.fromJson(json.decode(response.body));
    } else {
      throw Exception('Product not found');
    }
  }

  Future<void> updateStock(String productId, int quantityChange) async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/inventory/move');
    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'product_id': productId,
        'change_quantity': quantityChange,
        'reason': 'Mobile App Update',
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update stock');
    }
  }
}