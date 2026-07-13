import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load: restore session from local storage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Invalid email or password' 
      };
    }
  };

  const register = async (email, username, password, phone = '', otp = '', is_admin = false) => {
    try {
      await api.post('auth/register/', {
        email,
        username,
        password,
        phone,
        otp,
        is_admin
      });
      return { success: true };
    } catch (error) {
      const errors = error.response?.data;
      let errMsg = 'Registration failed';
      if (errors) {
        if (typeof errors === 'object') {
          errMsg = Object.values(errors).flat().join(' ');
        } else {
          errMsg = errors;
        }
      }
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('auth/logout/');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('auth/profile/', profileData);
      const updatedUser = response.data;
      
      // Update local storage and state, preserving role fields which are read-only in serialiser
      const fullUser = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);
      return { success: true, user: fullUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data ? Object.values(error.response.data).flat().join(' ') : 'Profile update failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
