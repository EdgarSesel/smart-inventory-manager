import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getDashboardKPIs } from '../services/api';
import InventoryModal from '../components/InventoryModal';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import AnomalyReport from '../components/AnomalyReport';
import ProductAnomalyModal from '../components/ProductAnomalyModal';

// MUI Imports
import { Box, Button, Container, Typography, AppBar, Toolbar, CircularProgress, Alert, Card, CardContent, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import AnalyticsIcon from '@mui/icons-material/Analytics'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import BarChartIcon from '@mui/icons-material/BarChart';

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isAnomalyModalOpen, setAnomalyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsData, kpisData] = await Promise.all([ getProducts(), getDashboardKPIs() ]);
      setProducts(productsData);
      setKpis(kpisData);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleOpenUpdateModal = (product) => {
    setSelectedProduct(product);
    setUpdateModalOpen(true);
  };
  const handleOpenAnomalyModal = (product) => { 
    setSelectedProduct(product);
    setAnomalyModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setUpdateModalOpen(false);
    setAnomalyModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateSuccess = () => {
    handleCloseModals();
    fetchDashboardData();
  };

  // Define the columns for the DataGrid
  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => navigate(`/products/${params.row.id}`)}
          sx={{ textTransform: 'none', justifyContent: 'flex-start', p: 0 }}
        >
          {params.value}
        </Button>
      )
    },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'quantity_on_hand', headerName: 'Quantity', type: 'number', flex: 0.5 },
    { field: 'reorder_point', headerName: 'Reorder Point', type: 'number', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenUpdateModal(params.row)}
            sx={{ mr: 1 }} // Add margin to the right
          >
            Update Stock
          </Button>
          {/* --- NEW CHART BUTTON --- */}
          <IconButton
            onClick={() => navigate(`/products/${params.row.id}`)}
            title="View Chart & Forecast"
          >
            <BarChartIcon />
          </IconButton>
          {/* --- NEW ANOMALY BUTTON --- */}
          <IconButton onClick={() => handleOpenAnomalyModal(params.row)} title="View Anomalies">
            <AnalyticsIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {kpis && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
            <StatCard title="Total Products" value={kpis.total_products} icon={<Inventory2Icon />} />
            <StatCard title="Low Stock Items" value={kpis.low_stock_items} icon={<WarningIcon />} />
          </Box>
        )}

        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Products
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={products}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection={false}
                disableSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>

         <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Global Anomaly Report</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AnomalyReport />
          </AccordionDetails>
        </Accordion>
      </Container>
      
      {selectedProduct && <InventoryModal isOpen={isUpdateModalOpen} onClose={handleCloseModals} product={selectedProduct} onSuccess={handleUpdateSuccess} />}
      {selectedProduct && <ProductAnomalyModal open={isAnomalyModalOpen} onClose={handleCloseModals} product={selectedProduct} />}
    </Box>
  );
};

export default DashboardPage;