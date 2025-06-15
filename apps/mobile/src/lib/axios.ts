import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://b151-178-133-8-111.ngrok-free.app/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const token = await AsyncStorage.getItem('token');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      token &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.get('/auth/refresh');
        const { accessToken } = response.data;

        await AsyncStorage.setItem('token', accessToken);
        originalRequest.headers.Authorization = accessToken;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
