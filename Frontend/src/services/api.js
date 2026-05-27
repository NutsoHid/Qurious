import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const YOUR_IP = "10.157.13.199"; 

const api = axios.create({
  baseURL: `http://10.157.13.199:5000/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  // Make sure your AuthContext is saving the token EXACTLY as "userToken"
  const token = await AsyncStorage.getItem("userToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;