import { StringRecord } from '@/types';

enum ApiControllers {
  Auth = 'auth',
  Users = 'users',
}

export const ApiRoute = {
  Auth: {
    Register: `${ApiControllers.Auth}/register`,
    Login: `${ApiControllers.Auth}/login`,
    Logout: `${ApiControllers.Auth}/logout`,
    Refresh: `${ApiControllers.Auth}/refresh`,
  },
  Users: {
    Me: `${ApiControllers.Users}/me`,
    // Block: `${ApiControllers.Users}/block`,
    // Unblock: `${ApiControllers.Users}/unblock`,
  },
} satisfies Record<keyof typeof ApiControllers, StringRecord<string>>;
