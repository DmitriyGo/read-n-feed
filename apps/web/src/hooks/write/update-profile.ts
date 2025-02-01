import {
  UpdateUserProfileDto,
  UserResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileDto) => {
      await axiosSecure.patch<UserResponseDto>(ApiRoute.Users.Me, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetProfile],
        type: 'active',
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
