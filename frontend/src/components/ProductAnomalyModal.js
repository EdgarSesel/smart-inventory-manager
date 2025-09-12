// src/components/ProductAnomalyModal.js
import React, { useEffect, useState } from 'react';
import { getAnomaliesForProduct } from '../services/api';
import { Dialog, DialogTitle, DialogContent, Alert, CircularProgress, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ProductAnomalyModal = ({ open, onClose, product }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product?.id) {
      setLoading(true);
      getAnomaliesForProduct(product.id)
        .then(data => setAnomalies(data))
        .catch(err => console.error("Failed to fetch product anomalies", err))
        .finally(() => setLoading(false));
    }
  }, [product]);

  const columns = [
  { field: 'event_date', headerName: 'Date', flex: 1 }, 
  { field: 'product_name', headerName: 'Product Name', flex: 1 },
  { field: 'reason', headerName: 'Reason', flex: 1 },
  { field: 'change_quantity', headerName: 'Quantity Change', type: 'number', flex: 0.5 },
];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Anomaly Report for {product?.name}</DialogTitle>
      <DialogContent>
        {loading ? <CircularProgress /> :
          anomalies.length > 0 ? (
            <Box sx={{ height: 300, width: '100%', mt: 2 }}>
              <DataGrid rows={anomalies} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>No anomalies detected for this product.</Alert>
          )
        }
      </DialogContent>
    </Dialog>
  );
};

export default ProductAnomalyModal;