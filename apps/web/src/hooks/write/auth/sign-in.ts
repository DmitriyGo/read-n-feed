import { LoginDto } from '@read-n-feed/application';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useSignIn = () => {
  const { handleSetAccessToken } = useAuth();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await axiosSecure.post<{
        accessToken: string;
      }>(ApiRoute.Auth.Login, data);

      handleSetAccessToken(response.data.accessToken);
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorLogin'));
    },
  });
};
