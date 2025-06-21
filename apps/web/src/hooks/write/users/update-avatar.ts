import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axiosSecure.post<{ url: string }>(
        ApiRoute.FileUpload.UserAvatar,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      await axiosSecure.patch(ApiRoute.Users.UpdateAvatar, {
        avatarUrl: uploadResponse.data.url,
      });

      return uploadResponse.data.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.Users.Profile] });
      toast.success(t('avatarUpdated'));
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorUpdateAvatar'));
    },
  });
};
