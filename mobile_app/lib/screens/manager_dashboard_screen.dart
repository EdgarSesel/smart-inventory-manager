// lib/screens/manager_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:mobile_app/models/product.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/login_screen.dart';
import 'package:mobile_app/screens/add_edit_product_screen.dart';
import 'package:mobile_app/screens/stock_update_screen.dart';

class ManagerDashboardScreen extends StatefulWidget {
  const ManagerDashboardScreen({super.key});
  @override
  State<ManagerDashboardScreen> createState() => _ManagerDashboardScreenState();
}

class _ManagerDashboardScreenState extends State<ManagerDashboardScreen> {
  final ApiService _apiService = ApiService();
  late Future<Map<String, dynamic>> _kpisFuture;
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() {
    setState(() {
      _kpisFuture = _apiService.getDashboardKPIs();
      _productsFuture = _apiService.getProducts();
    });
  }

  Future<void> _logout() async {
    await _apiService.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }

  void _navigateToAddEditScreen({Product? product}) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => AddEditProductScreen(product: product)),
    ).then((_) {
      if (!mounted) return;
      _fetchData();
    }); // Refresh data when we return
  }

  void _navigateToStockUpdate({String? sku}) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => StockUpdateScreen(prefilledSku: sku)),
    ).then((_) {
      if (!mounted) return;
      _fetchData();
    });
  }

  Future<void> _deleteProduct(String productId, String productName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: Text('Delete product "$productName"? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await _apiService.deleteProduct(productId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Product deleted'), backgroundColor: Colors.green));
      _fetchData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete product'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manager Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Trigger new fetch and wait for the results so the refresh indicator completes properly
          _fetchData();
          try {
            await _kpisFuture;
            await _productsFuture;
          } catch (_) {
            // ignore errors here; builder will show error state
          }
        },
        child: ListView(
          padding: const EdgeInsets.all(8.0),
          children: [
            FutureBuilder<Map<String, dynamic>>(
              future: _kpisFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const LinearProgressIndicator();
                if (snapshot.hasError) return const SizedBox();
                final kpis = snapshot.data!;
                return Row(
                  children: [
                    Expanded(child: KpiCard(title: 'Total Products', value: kpis['total_products'].toString())),
                    const SizedBox(width: 8),
                    Expanded(child: KpiCard(title: 'Low Stock Items', value: kpis['low_stock_items'].toString())),
                  ],
                );
              },
            ),
            const SizedBox(height: 16),
            Text('Products', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            FutureBuilder<List<Product>>(
              future: _productsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
                if (!snapshot.hasData || snapshot.data!.isEmpty) return const Center(child: Text('No products found.'));
                final products = snapshot.data!;
                return Column(
                  children: products.map((product) => Card(
                    elevation: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    child: ListTile(
                      title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('SKU: ${product.sku}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Qty: ${product.quantityOnHand}', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(width: 8),
                          // Update Stock button (managers can also update stock)
                          IconButton(
                            icon: const Icon(Icons.inventory_2),
                            tooltip: 'Update Stock',
                            onPressed: () => _navigateToStockUpdate(sku: product.sku),
                          ),
                          const SizedBox(width: 4),
                          // Delete product (manager only)
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            tooltip: 'Delete Product',
                            onPressed: () => _deleteProduct(product.id, product.name),
                          ),
                          const SizedBox(width: 4),
                          // Edit product
                          IconButton(
                            icon: const Icon(Icons.edit),
                            tooltip: 'Edit',
                            onPressed: () => _navigateToAddEditScreen(product: product),
                          ),
                        ],
                      ),
                      onTap: () => _navigateToAddEditScreen(product: product),
                    ),
                  )).toList(),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateToAddEditScreen(),
        tooltip: 'Add Product',
        child: const Icon(Icons.add),
      ),
    );
  }
}

class KpiCard extends StatelessWidget {
  final String title;
  final String value;
  const KpiCard({super.key, required this.title, required this.value});
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(title, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
    );
  }
}