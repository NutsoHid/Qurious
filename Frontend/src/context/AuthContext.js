import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (userToken && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log('Error restoring session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const login = async (identifier, password) => {
    try {
      let payload = { password: password };
      if (identifier.includes('@')) {
        payload.email = identifier.toLowerCase().trim();
      } else {
        payload.userName = identifier.trim();
      }

      const response = await api.post('/user/signin', payload);
      const { activeToken, userData } = response.data;

      await AsyncStorage.setItem('userToken', activeToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Login Error:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Check your credentials.' 
      };
    }
  };

  const signup = async (name, userName, email, profession, password) => {
    try {
      await api.post('/user/signup', {
        name,
        userName: userName.trim(),
        email: email.toLowerCase().trim(),
        profession,
        password
      });

      // THE FIX: We removed the auto-login logic here!
      // We just return success so the UI knows to send them to the login screen.
      return { success: true };
    } catch (error) {
      console.log('Signup Error:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create account.' 
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ login, signup, logout, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};