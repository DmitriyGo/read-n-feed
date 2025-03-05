import { StringRecord } from '@/types';

enum ApiControllers {
  Auth = 'auth',
  Users = 'users',
  Books = 'books',
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
  Books: {
    Base: `${ApiControllers.Books}/`,
    MostLiked: `${ApiControllers.Books}/most-liked`,
  },
} satisfies Record<keyof typeof ApiControllers, StringRecord<string>>;
