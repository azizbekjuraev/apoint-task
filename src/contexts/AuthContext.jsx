import { createContext, useState, useEffect } from 'react';
import axios from '../config/api';

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkTokenValidity = () => {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setToken(savedToken);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    setLoading(false);
  };

  useEffect(() => {
    checkTokenValidity();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (username, password) => {
    try {
      const response = await axios.post('/hr/user/sign-in?include=token', {
        username,
        password
      });

      const { token: tokenObject } = response.data;
      
      if (tokenObject && tokenObject.token) {
        const authToken = tokenObject.token;
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', authToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 