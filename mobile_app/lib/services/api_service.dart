// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/models/product.dart';

class ApiService {
  final String _baseUrl = 'http://10.0.2.2:8000';

  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');
    if (token == null) {
      throw Exception('No auth token found');
    }
    return token;
  }
  Future<String> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/login/token');
    try {
      // Send as form data (application/x-www-form-urlencoded)
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {'username': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> decoded = json.decode(response.body);
        final token = decoded['access_token'] as String?;
        final userRole = decoded['user_role'] as String?; // backend returns "user_role"

        if (token == null || userRole == null) {
          throw Exception('Invalid authentication response from server');
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('authToken', token);
        await prefs.setString('userRole', userRole);

        return userRole;
      } else {
        // Try to surface backend message if available
        String message = 'Login failed';
        try {
          final Map<String, dynamic> err = json.decode(response.body);
          if (err.containsKey('detail')) message = err['detail'].toString();
        } catch (_) {}
        throw Exception('Login failed: $message');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }
 Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
    await prefs.remove('userRole'); // Don't forget the role
  }
  
Future<Map<String, dynamic>> getDashboardKPIs() async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/analytics/kpis');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load KPIs');
    }
  }

  Future<Product> createProduct(Map<String, dynamic> productData) async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/');
    final response = await http.post(
      url,
      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      body: json.encode(productData),
    );
    if (response.statusCode == 200) {
      return Product.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create product');
    }
  }
  
  Future<List<Product>> getProducts() async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      if (decoded is List) {
        return decoded.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
      } else {
        throw Exception('Unexpected products payload');
      }
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future<Product> findProductBySku(String sku) async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/sku/$sku');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
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
      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
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

  // Delete a product (manager-only)
  Future<void> deleteProduct(String productId) async {
    final token = await _getToken();
    final url = Uri.parse('$_baseUrl/products/$productId');
    final response = await http.delete(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete product');
    }
  }
}