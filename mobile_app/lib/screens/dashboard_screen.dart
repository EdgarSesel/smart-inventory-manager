// lib/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:mobile_app/models/product.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/login_screen.dart';
import 'package:mobile_app/screens/stock_update_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  void _fetchProducts() {
    setState(() {
      _productsFuture = _apiService.getProducts();
    });
  }

  Future<void> _logout() async {
    await _apiService.logout();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }

  void _navigateToStockUpdate({String? sku}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => StockUpdateScreen(prefilledSku: sku),
      ),
    ).then((_) {
      // This .then() block runs when we navigate BACK from the update screen.
      // It calls our helper function to refresh the product list.
      _fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _fetchProducts(),
        child: FutureBuilder<List<Product>>(
          future: _productsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const Center(child: Text('No products found. Pull to refresh.'));
            }

            final products = snapshot.data!;
            return ListView.builder(
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                  child: ListTile(
                    title: Text(product.name),
                    subtitle: Text('SKU: ${product.sku}'),
                    trailing: Text(
                      'Qty: ${product.quantityOnHand}',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    onTap: () {
                      // Navigate by tapping the whole card, pre-filling the SKU
                      _navigateToStockUpdate(sku: product.sku);
                    },
                  ),
                );
              },
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate without pre-filling the SKU for a "fresh scan"
          _navigateToStockUpdate();
        },
        tooltip: 'Scan New Item',
        child: const Icon(Icons.qr_code_scanner),
      ),
    );
  }
}