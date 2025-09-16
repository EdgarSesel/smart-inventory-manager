// src/pages/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getDashboardKPIs, deleteProduct } from '../services/api';
import InventoryModal from '../components/InventoryModal';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import AnomalyReport from '../components/AnomalyReport';
import ProductAnomalyModal from '../components/ProductAnomalyModal';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';

// MUI Imports
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';

const DashboardPage = () => {
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    update: false,
    anomaly: false,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Delete dialog + snackbar state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDashboardData = useCallback(async () => {
    if (!userRole) return; // Don't fetch if role isn't determined yet
    try {
      if (userRole === 'manager') {
        const [productsData, kpisData] = await Promise.all([ getProducts(), getDashboardKPIs() ]);
        setProducts(productsData);
        setKpis(kpisData);
      } else {
        const productsData = await getProducts();
        setProducts(productsData);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenModal = (modalName, product = null) => {
    setSelectedProduct(product);
    setModalState(prev => ({ ...prev, [modalName]: true }));
  };
  
  const handleCloseModals = () => {
    setModalState({ add: false, edit: false, update: false, anomaly: false });
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    fetchDashboardData();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'quantity_on_hand', headerName: 'Quantity', type: 'number', flex: 0.5 },
    { field: 'reorder_point', headerName: 'Reorder Point', type: 'number', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      flex: 1.2,
      renderCell: (params) => (
        <Box>
          <Button variant="outlined" size="small" sx={{ mr: 0.5 }} onClick={() => handleOpenModal('update', params.row)}>
            Update Stock
          </Button>
          {userRole === 'manager' && (
            <>
              <Button variant="outlined" size="small" color="error" sx={{ mr: 0.5 }} onClick={() => { setProductToDelete(params.row); setDeleteDialogOpen(true); }}>
                Delete
              </Button>
              <IconButton onClick={() => handleOpenModal('edit', params.row)} title="Edit Product Details"><EditIcon /></IconButton>
              <IconButton onClick={() => navigate(`/products/${params.row.id}`)} title="View Chart & Forecast"><BarChartIcon /></IconButton>
              <IconButton onClick={() => handleOpenModal('anomaly', params.row)} title="View Anomalies"><AnalyticsIcon /></IconButton>
            </>
          )}
        </Box>
      )
    }
  ];

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete?.id) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete product', err);
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <AppBar position="static">
          <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Inventory Dashboard
              </Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
          </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {userRole === 'manager' && kpis && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
                <StatCard title="Total Products" value={kpis.total_products} icon={<Inventory2Icon />} />
                <StatCard title="Low Stock Items" value={kpis.low_stock_items} icon={<WarningIcon />} />
              </Box>
            )}

            <Card sx={{ boxShadow: 3, mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">Products</Typography>
                  {userRole === 'manager' && (
                    <Button variant="contained" onClick={() => handleOpenModal('add')}>
                      Add Product
                    </Button>
                  )}
                </Box>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid rows={products} columns={columns} />
                </Box>
              </CardContent>
            </Card>
            
            {userRole === 'manager' && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h5">Global Anomaly Report</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AnomalyReport />
                </AccordionDetails>
              </Accordion>
            )}
          </>
        )}
      </Container>
      
      <AddProductModal open={modalState.add} onClose={handleCloseModals} onSuccess={handleSuccess} />
      {selectedProduct && <EditProductModal open={modalState.edit} onClose={handleCloseModals} product={selectedProduct} onSuccess={handleSuccess} />}
      {selectedProduct && <InventoryModal open={modalState.update} onClose={handleCloseModals} product={selectedProduct} onSuccess={handleSuccess} />}
      {selectedProduct && <ProductAnomalyModal open={modalState.anomaly} onClose={handleCloseModals} product={selectedProduct} />}

      {/* Soft delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            {productToDelete ? `Delete product "${productToDelete.name}" (SKU: ${productToDelete.sku})? This action cannot be undone.` : 'Delete product?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>Cancel</Button>
          <Button onClick={confirmDeleteProduct} color="error" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;