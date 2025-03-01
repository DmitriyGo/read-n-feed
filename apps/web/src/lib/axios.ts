import Axios from 'axios';

import { ApiRoute } from '@/constants';
import { env } from '@/env';
import { useAuthStore } from '@/store/auth-store';

export const axiosBase = Axios.create({
  baseURL: env.VITE_API_URL,
});

export const axiosSecure = Axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

axiosSecure.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

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
      [
        ApiRoute.Auth.Refresh,
        ApiRoute.Auth.Register,
        ApiRoute.Auth.Login,
      ].every((route) => route !== error.response.config.url)
    ) {
      useAuthStore.getState().setAccessToken(null);

      const {
        data: { accessToken },
      } = await axiosSecure.get<{ accessToken: string }>(ApiRoute.Auth.Refresh);

      useAuthStore.getState().setAccessToken(accessToken);

      console.log(1, useAuthStore.getState().accessToken);

      error.config.headers.Authorization = accessToken;

      return axiosSecure.request(error.config);
    }

    return Promise.reject(error.response.data.message);
  },
);
