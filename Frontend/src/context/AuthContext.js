import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api'; // The API file we created earlier

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (userToken && userData) {
        setUser(JSON.parse(userData)); // Restore the user session
      }
    } catch (e) {
      console.log('Error restoring session:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);


    const login = async (userNameOrEmail, password) => {
    try {
        // We send 'identifier' so your friend's backend knows to check this one value
        const response = await api.post('/user/signin', {
        identifier: userNameOrEmail, 
        password: password
        });

        const { activeToken, userData } = response.data;

        await AsyncStorage.setItem('userToken', activeToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
    } catch (error) {
        console.log('Login Error:', error.response?.data || error.message);
        return { 
        success: false, 
        message: error.response?.data?.message || 'Something went wrong' 
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
    <AuthContext.Provider value={{ login, logout, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};