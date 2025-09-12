// src/pages/ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails, getProductHistory, getProductForecast, getProductScheduled } from '../services/api';
import { Line } from 'react-chartjs-2';

// MUI Imports
import { 
    Box, 
    Container, 
    Typography, 
    AppBar, 
    Toolbar, 
    CircularProgress, 
    Alert,
    Card,
    CardContent,
    Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); // Use useNavigate for navigation
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [details, historyData, forecastData, scheduledData] = await Promise.all([
          getProductDetails(productId),
          getProductHistory(productId),
          getProductForecast(productId),
          getProductScheduled(productId)
        ]);
        setProduct(details);
        setHistory(historyData);
        setForecast(forecastData);
        setScheduled(scheduledData);
      } catch (err) {
        setError("Failed to fetch product data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const chartData = {
    datasets: [
      {
        label: 'Actual Quantity On Hand',
        data: history.map(point => ({ x: new Date(point.timestamp), y: point.quantity })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      ...(forecast.length > 0 ? [{
        label: 'Forecasted Demand (Units/Day)',
        data: forecast.map(point => ({ x: new Date(point.timestamp), y: point.quantity })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1
      }] : []),
      ...(scheduled.length > 0 ? [{
                label: 'Scheduled Quantity',
                data: scheduled.map(point => ({ x: new Date(point.timestamp), y: point.quantity })),
                borderColor: 'rgb(156, 39, 176)', // A nice purple
                backgroundColor: 'rgba(156, 39, 176, 0.5)',
                borderDash: [10, 5], // A different dash style
                tension: 0.1
            }] : [])
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy' },
        title: { display: true, text: 'Date' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Quantity' }
      }
    },
    interaction: { mode: 'index', intersect: false },
    maintainAspectRatio: false // Important for responsive chart
  };
  
  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }
    if (!product) {
      return <Alert severity="warning" sx={{ m: 4 }}>Product not found.</Alert>;
    }
    return (
      <Card sx={{ m: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Stock History & Demand Forecast
          </Typography>
          <Box sx={{ height: 400 }}> {/* Give the chart a fixed height */}
            {history.length > 0 || forecast.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Typography sx={{ textAlign: 'center', mt: 4 }}>
                No historical data available to display a chart. Please add some sales movements.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Button 
            color="inherit" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {product ? product.name : 'Loading...'}
          </Typography>
          <Typography variant="body1" component="div" sx={{ minWidth: '150px', textAlign: 'right' }}>
            {product ? `SKU: ${product.sku}` : ''}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        {renderContent()}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;