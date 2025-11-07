import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = "https://click-lar-api-wcvm.vercel.app/api"
const client = axios.create({
  baseURL,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;