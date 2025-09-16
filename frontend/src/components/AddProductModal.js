// src/components/AddProductModal.js
import React, { useState } from 'react';
import { createProduct } from '../services/api';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Alert
} from '@mui/material';

const AddProductModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [reorderPoint, setReorderPoint] = useState('10'); // Default as string
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!name || !sku) {
      setError('Name and SKU are required.');
      return;
    }

    try {
      await createProduct({
        name,
        sku,
        description,
        reorder_point: parseInt(reorderPoint) || 0,
      });
      onSuccess(); // telling parent component about success
    } catch (err) {
      setError('Failed to create product. The SKU might already exist.');
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="SKU (Stock Keeping Unit)"
            type="text"
            fullWidth
            variant="outlined"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Reorder Point"
            type="number"
            fullWidth
            variant="outlined"
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add Product</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductModal;