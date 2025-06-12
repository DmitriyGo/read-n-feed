import Axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { ApiRoute } from '@/constants';
import { env } from '@/env';
import { useAuthStore } from '@/store/auth-store';
import { AuthTokens } from '@/types/auth.types';

export const axiosBase = Axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

export const axiosSecure = Axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

axiosSecure.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && config.headers) {
      config.headers.Authorization = accessToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const clearAuth = () => {
  useAuthStore.getState().clearAuth();
};

axiosSecure.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't retry for auth endpoints to prevent infinite loops
      ![
        ApiRoute.Auth.Refresh,
        ApiRoute.Auth.Register,
        ApiRoute.Auth.Login,
      ].some((route) => originalRequest.url?.includes(route))
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axiosSecure.get<AuthTokens>(
            ApiRoute.Auth.Refresh,
          );
          const { accessToken } = response.data;

          // Update auth store with new token
          useAuthStore.getState().setAccessToken(accessToken);

          // Notify all queued requests
          onTokenRefreshed(accessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = accessToken;
          }

          return axiosSecure.request(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth state
          clearAuth();

          // Notify queued requests of failure
          refreshSubscribers.forEach((cb) => cb(''));
          refreshSubscribers = [];

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (token) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = token;
              }
              resolve(axiosSecure.request(originalRequest));
            } else {
              reject(new Error('Token refresh failed'));
            }
          });
        });
      }
    }

    // For other errors, reject with the error message or the full error
    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
    ) {
      return Promise.reject(
        (error.response.data as { message: string }).message,
      );
    }

    return Promise.reject(error);
  },
);
