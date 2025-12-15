// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const login = async (credentials) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any credentials
      const userData = {
        id: Date.now(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};