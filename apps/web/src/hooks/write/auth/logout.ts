import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib';

export const useLogout = () => {
  const { clearAccessToken } = useAuth();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      await axiosSecure.post(ApiRoute.Auth.Logout);

      clearAccessToken();
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorLogout'));
    },
  });
};
