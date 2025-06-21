import { RegisterDto, UserResponseDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useSignUp = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      await axiosSecure.post<UserResponseDto>(ApiRoute.Auth.Register, data);
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorSignUp'));
    },
  });
};
