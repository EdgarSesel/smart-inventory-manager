// lib/screens/add_edit_product_screen.dart
import 'package:flutter/material.dart';
import 'package:mobile_app/models/product.dart';
import 'package:mobile_app/services/api_service.dart';

class AddEditProductScreen extends StatefulWidget {
  final Product? product; // If product is null, it's 'Add' mode. Otherwise, 'Edit' mode.
  const AddEditProductScreen({super.key, this.product});

  @override
  State<AddEditProductScreen> createState() => _AddEditProductScreenState();
}

class _AddEditProductScreenState extends State<AddEditProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiService = ApiService();
  
  late TextEditingController _nameController;
  late TextEditingController _skuController;
  late TextEditingController _descriptionController;
  late TextEditingController _reorderPointController;

  bool get _isEditing => widget.product != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? '');
    _skuController = TextEditingController(text: widget.product?.sku ?? '');
    // Product model needs description and reorder point, let's assume they exist
    _descriptionController = TextEditingController(text: ''); // Add this
    _reorderPointController = TextEditingController(text: '10'); // Add this
  }
  
  Future<void> _saveProduct() async {
    if (_formKey.currentState!.validate()) {
      final productData = {
        'name': _nameController.text,
        'sku': _skuController.text,
        'description': _descriptionController.text,
        'reorder_point': int.tryParse(_reorderPointController.text) ?? 10,
      };
      
      try {
        if (_isEditing) {
          // TODO: Implement updateProduct in ApiService
        } else {
          await _apiService.createProduct(productData);
        }
        if (!mounted) return;
        Navigator.of(context).pop(); // Go back to dashboard on success
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Product' : 'Add Product'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Product Name'),
                validator: (value) => value!.isEmpty ? 'Please enter a name' : null,
              ),
              TextFormField(
                controller: _skuController,
                decoration: const InputDecoration(labelText: 'SKU'),
                validator: (value) => value!.isEmpty ? 'Please enter an SKU' : null,
              ),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              TextFormField(
                controller: _reorderPointController,
                decoration: const InputDecoration(labelText: 'Reorder Point'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _saveProduct,
                child: Text(_isEditing ? 'Save Changes' : 'Add Product'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}