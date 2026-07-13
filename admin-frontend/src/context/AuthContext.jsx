import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore administrator session
    const storedUser = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('admin_access_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      if (!userData.is_admin) {
        return {
          success: false,
          message: 'Access Denied: You do not possess administrator credentials.'
        };
      }
      
      localStorage.setItem('admin_access_token', access);
      localStorage.setItem('admin_refresh_token', refresh);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Invalid email or password' 
      };
    }
  };

  const logout = async () => {
    try {
      // Invalidate on backend
      const refresh = localStorage.getItem('admin_refresh_token');
      if (refresh) {
        await api.post('auth/logout/', { refresh });
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
