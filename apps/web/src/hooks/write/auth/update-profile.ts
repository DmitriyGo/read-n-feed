import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAuth } from '../../use-auth';

import { authApi } from '@/api/auth.api';
import { QueryKey } from '@/constants';
import { UpdateUserProfileDto } from '@/types/auth.types';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { handleSetUser } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileDto) => {
      return await authApi.updateProfile(data);
    },
    onSuccess: (updatedUser) => {
      handleSetUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: [QueryKey.Auth.Profile] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.Users.Profile] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile';
      console.error('Update profile error:', error);
      toast.error(message);
    },
  });
};
