// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// This interceptor automatically adds the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  try {
    const response = await apiClient.post('/login/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateInventory = async (productId, changeQuantity, reason) => {
  try {
    const response = await apiClient.post('/inventory/move', {
      product_id: productId,
      change_quantity: parseInt(changeQuantity),
      reason: reason,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardKPIs = async () => {
  try {
    const response = await apiClient.get('/analytics/kpis');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductHistory = async (productId) => {
  try {
    const response = await apiClient.get(`/analytics/historical/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductForecast = async (productId) => {
  try {
    const response = await apiClient.get(`/analytics/forecast/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductScheduled = async (productId) => {
  try {
    const response = await apiClient.get(`/analytics/scheduled/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnomalies = async () => {
  try {
    const response = await apiClient.get('/analytics/anomalies');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnomaliesForProduct = async (productId) => {
  try {
    const response = await apiClient.get(`/analytics/anomalies/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products/', productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};