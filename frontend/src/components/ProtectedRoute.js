// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // If there's no token, redirect to the /login page
    return <Navigate to="/login" />;
  }

  // If there is a token, render the child components
  return children;
};

export default ProtectedRoute;