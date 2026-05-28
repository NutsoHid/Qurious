import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const YOUR_IP = "172.29.80.1"; 

const api = axios.create({
  baseURL: `http://172.29.80.1:5000/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;