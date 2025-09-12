// lib/screens/stock_update_screen.dart
import 'package:flutter/material.dart';
import 'package:mobile_app/models/product.dart';
import 'package:mobile_app/services/api_service.dart';

class StockUpdateScreen extends StatefulWidget {
  // This allows the dashboard to pass in a SKU
  final String? prefilledSku;
  
  const StockUpdateScreen({super.key, this.prefilledSku});

  @override
  State<StockUpdateScreen> createState() => _StockUpdateScreenState();
}

class _StockUpdateScreenState extends State<StockUpdateScreen> {
  final _skuController = TextEditingController();
  final _quantityController = TextEditingController();
  final _apiService = ApiService();

  Product? _foundProduct;
  bool _isLoading = false;
  String _message = 'Enter an SKU to begin.';

  @override
  void initState() {
    super.initState();
    // If a SKU was passed from the dashboard, fill it in and search automatically.
    if (widget.prefilledSku != null) {
      _skuController.text = widget.prefilledSku!;
      // We run this after the first frame to ensure the UI is built.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _findProductBySku();
      });
    }
  }

  Future<void> _findProductBySku() async {
    if (_skuController.text.isEmpty) return;
    FocusScope.of(context).unfocus(); // Hide the keyboard
    
    setState(() {
      _isLoading = true;
      _foundProduct = null;
      _message = ''; // Clear any previous message
    });

    try {
      final product = await _apiService.findProductBySku(_skuController.text);
      setState(() {
        _foundProduct = product;
        _quantityController.clear();
      });
    } catch (e) {
      setState(() {
        _message = 'Product not found.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _updateStock() async {
    if (_foundProduct == null || _quantityController.text.isEmpty) return;
    FocusScope.of(context).unfocus();

    final quantityChange = int.tryParse(_quantityController.text);
    if (quantityChange == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid quantity.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() { _isLoading = true; });

    try {
      await _apiService.updateStock(_foundProduct!.id, quantityChange);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Stock updated successfully!'), backgroundColor: Colors.green),
      );
      Navigator.of(context).pop(); // Go back to the dashboard on success
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update stock.'), backgroundColor: Colors.red),
      );
      setState(() { _isLoading = false; }); // Only stop loading on error here
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Update Stock'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView( // Prevents keyboard from causing overflow
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: _skuController,
                decoration: InputDecoration(
                  labelText: 'Enter Product SKU',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.search),
                    onPressed: _findProductBySku,
                  ),
                ),
                onSubmitted: (_) => _findProductBySku(),
              ),
              const SizedBox(height: 24),

              if (_isLoading)
                const Center(child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ))
              else if (_foundProduct != null)
                _buildUpdateForm()
              else
                Center(child: Text(_message)),
            ],
          ),
        ),
      ),
    );
  }

  // Helper widget for the update form part
  Widget _buildUpdateForm() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Product: ${_foundProduct!.name}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Current Quantity: ${_foundProduct!.quantityOnHand}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _quantityController,
              decoration: const InputDecoration(labelText: 'Quantity Change (e.g., 50 or -10)'),
              keyboardType: const TextInputType.numberWithOptions(signed: true),
              autofocus: true,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _updateStock,
                child: const Text('Submit Update'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}