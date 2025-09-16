// src/components/InventoryModal.js
import React, { useState } from 'react';
import { updateInventory } from '../services/api';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Typography } from '@mui/material';

const InventoryModal = ({ open, onClose, product, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Shipment Received');
  
  const handleSubmit = async () => {
    const changeQuantity = reason === 'Sale' ? -Math.abs(parseInt(quantity)) : parseInt(quantity);
    if (isNaN(changeQuantity) || changeQuantity === 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    try {
      await updateInventory(product.id, changeQuantity, reason);
      onSuccess();
    } catch (error) {
      alert('Failed to update inventory.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Stock for {product?.name}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Typography sx={{ mb: 2 }}>Current Quantity: {product?.quantity_on_hand}</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity Change"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 50 for incoming, 10 for sale"
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Reason</InputLabel>
            <Select value={reason} label="Reason" onChange={(e) => setReason(e.target.value)}>
              <MenuItem value="Shipment Received">Shipment Received (+)</MenuItem>
              <MenuItem value="Sale">Sale (-)</MenuItem>
              <MenuItem value="Correction">Correction (+/-)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryModal;