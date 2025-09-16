// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react'; // <-- TYPO FIXED
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  // NAUJAS STATE ROLĖS SAUGOJIMUI
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const navigate = useNavigate();

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    // SAUGOME NE TIK TOKENĄ, BET IR ROLĘ
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('userRole', data.user_role);
    setToken(data.access_token);
    setUserRole(data.user_role);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole'); // NEPAMIRŠKITE IŠTRINTI IR ROLĖS
    setToken(null);
    setUserRole(null);
    navigate('/login');
  };

  const value = { token, userRole, login, logout }; // PATEIKIAME ROLĘ PER KONTEKSTĄ

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};