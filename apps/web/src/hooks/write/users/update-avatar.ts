import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAuth } from '../../use-auth';

import { authApi } from '@/api/auth.api';
import { QueryKey } from '@/constants';

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { handleSetUser } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return await authApi.updateAvatar(formData);
    },
    onSuccess: (updatedUser) => {
      handleSetUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: [QueryKey.Auth.Profile] });
      queryClient.invalidateQueries({ queryKey: [QueryKey.Users.Profile] });
      toast.success('Avatar updated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update avatar';
      console.error('Update avatar error:', error);
      toast.error(message);
    },
  });
};
