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
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.Users.Profile],
            type: 'active',
          }),
        500,
      );
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
