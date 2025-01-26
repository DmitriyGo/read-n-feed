import Axios from 'axios';

import { ACCESS_TOKEN, ApiRoute } from '@/constants';
import { env } from '@/env';

export const axiosBase = Axios.create({
  baseURL: env.VITE_API_URL,
});

export const axiosSecure = Axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

axiosSecure.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  if (accessToken) {
    config.headers.Authorization = accessToken;
  }

  return config;
});

axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response.data.message === 'TokenExpiredError'
    ) {
      localStorage.removeItem(ACCESS_TOKEN);

      const {
        data: { accessToken },
      } = await axiosBase.get<{ accessToken: string }>(ApiRoute.Auth.Refresh);

      localStorage.setItem(ACCESS_TOKEN, accessToken);

      error.config.headers.Authorization = accessToken;

      return axiosSecure.request(error.config);
    }

    return Promise.reject(error);
  },
);
