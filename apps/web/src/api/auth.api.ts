import { ApiRoute } from '@/constants';
import { axiosBase, axiosSecure } from '@/lib/axios';
import {
  LoginDto,
  RegisterDto,
  AuthTokens,
  User,
  Session,
  UpdateUserProfileDto,
} from '@/types/auth.types';

export const authApi = {
  register: async (data: RegisterDto): Promise<User> => {
    const response = await axiosBase.post<User>(ApiRoute.Auth.Register, data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthTokens> => {
    const response = await axiosBase.post<AuthTokens>(
      ApiRoute.Auth.Login,
      data,
    );
    return response.data;
  },

  refresh: async (): Promise<AuthTokens> => {
    const response = await axiosSecure.get<AuthTokens>(ApiRoute.Auth.Refresh);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosSecure.post(ApiRoute.Auth.Logout);
  },

  logoutAll: async (): Promise<void> => {
    await axiosSecure.post(ApiRoute.Auth.LogoutAll);
  },

  getSessions: async (): Promise<Session[]> => {
    const response = await axiosSecure.get<Session[]>(ApiRoute.Auth.Sessions);
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await axiosSecure.delete(ApiRoute.Auth.RevokeSession(sessionId));
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosSecure.get<User>(ApiRoute.Users.Me);
    return response.data;
  },

  updateProfile: async (data: UpdateUserProfileDto): Promise<User> => {
    const response = await axiosSecure.patch<User>(
      ApiRoute.Users.UpdateMe,
      data,
    );
    return response.data;
  },

  updateAvatar: async (formData: FormData): Promise<User> => {
    const response = await axiosSecure.patch<User>(
      ApiRoute.Users.UpdateAvatar,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
