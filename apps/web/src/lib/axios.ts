import Axios from 'axios';

import { env } from '@/env';

export const axiosBase = Axios.create({
  baseURL: env.VITE_API_URL,
});

export const axiosSecure = Axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});
