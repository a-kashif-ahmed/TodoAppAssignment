import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const BASE_URL = 'http://10.165.98.35:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach the JWT token (if present) to every outgoing request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
