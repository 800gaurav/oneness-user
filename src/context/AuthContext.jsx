import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // Check token expiry without library
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setUser(JSON.parse(userData));
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      // If no users exist, auto-register first user as admin
      if (error.response?.status === 404 || error.response?.data?.message?.includes('No users')) {
        try {
          const registerData = {
            name: 'Bakery Owner',
            email: credentials.email,
            password: credentials.password,
            bakeryName: 'My Bakery',
            role: 'admin'
          };
          const regResponse = await authAPI.register(registerData);
          const { token, ...userData } = regResponse.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          
          toast.success('Account created and logged in!');
          return { success: true };
        } catch (regError) {
          toast.error('Failed to create account');
          return { success: false };
        }
      }
      
      toast.error(error.response?.data?.message || 'Invalid email or password');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const sendOtp = async (payload) => {
    try {
      const response = await authAPI.sendOtp(payload);
      toast.success(response.data.message || 'OTP sent successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyOtp = async (payload) => {
    try {
      const response = await authAPI.verifyOtp(payload);
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(payload.action === 'register' ? 'Registration successful!' : 'Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
