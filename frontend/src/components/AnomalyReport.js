// src/components/AnomalyReport.js
import React, { useEffect, useState } from 'react';
import { getAnomalies } from '../services/api';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const AnomalyReport = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const data = await getAnomalies();
        setAnomalies(data);
      } catch (error) {
        console.error("Failed to fetch anomalies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, []);
  
  const columns = [
  { field: 'event_date', headerName: 'Date', flex: 1 }, 
  { field: 'product_name', headerName: 'Product Name', flex: 1 },
  { field: 'reason', headerName: 'Reason', flex: 1 },
  { field: 'change_quantity', headerName: 'Quantity Change', type: 'number', flex: 0.5 },
];

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Anomaly Report
      </Typography>
      {anomalies.length > 0 ? (
         <Box sx={{ height: 300, width: '100%', backgroundColor: 'white' }}>
            <DataGrid
                rows={anomalies}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // Style rows to show they are alerts
                getRowClassName={(params) => 'super-app-theme--anomaly'}
            />
        </Box>
      ) : (
        <Alert severity="info">No unusual movements detected.</Alert>
      )}
    </Box>
  );
};

export default AnomalyReport;