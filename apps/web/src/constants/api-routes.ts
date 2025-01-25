import { StringRecord } from '@/types';

enum ApiControllers {
  Auth = 'auth',
}

export const ApiRoute = {
  Auth: {
    Register: `${ApiControllers.Auth}/register`,
    Login: `${ApiControllers.Auth}/login`,
    Logout: `${ApiControllers.Auth}/logout`,
    Refresh: `${ApiControllers.Auth}/refresh`,
  },
} satisfies Record<keyof typeof ApiControllers, StringRecord<string>>;
