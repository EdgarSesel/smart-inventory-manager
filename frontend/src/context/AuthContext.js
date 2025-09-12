// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react'; // <-- TYPO FIXED
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const navigate = useNavigate();

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('authToken', data.access_token);
    setToken(data.access_token);
    navigate('/'); // Redirect to dashboard on successful login
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    navigate('/login'); // Redirect to login on logout
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};