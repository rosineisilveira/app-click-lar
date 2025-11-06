import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await client.post('/login', { email, password });
      const token = response.data.token;
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Erro no login:', error.response?.data);
      throw new Error('Email ou senha inválidos.');
    }
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const tokenPromise = AsyncStorage.getItem('userToken');

        const timerPromise = new Promise(resolve => setTimeout(resolve, 2000)); 
        
        const [userTokenResult] = await Promise.all([tokenPromise, timerPromise]);

        setUserToken(userTokenResult);
      } catch (e) {
        console.log(`Erro ao verificar login: ${e}`);
      } finally {
        
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};