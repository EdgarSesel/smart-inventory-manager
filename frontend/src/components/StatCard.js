// src/components/StatCard.js
import React from 'react';

// Import MUI components
import { Card, CardContent, Typography, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

const StatCard = ({ title, value, icon }) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 3 }}>
      <Box sx={{ 
          mr: 2, 
          backgroundColor: 'primary.main', 
          color: 'white', 
          borderRadius: '50%', 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {icon}
      </Box>
      <Box>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;