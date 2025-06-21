import {
  UpdateUserProfileDto,
  UserResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
      toast.error(t('errorUpdateProfile'));
    },
  });
};
