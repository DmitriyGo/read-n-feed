import {
  BookRequestResponseDto,
  CreateBookRequestDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useCreateBookRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (
      data: CreateBookRequestDto & { file: File; coverImage?: File },
    ) => {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (key !== 'file' && key !== 'coverImage' && value) {
          formData.append(key, String(value));
        }
      }

      formData.append('file', data.file);

      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      return await axiosSecure.post<BookRequestResponseDto>(
        ApiRoute.BookRequests.Create,
        formData,
      );
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.BookRequests.MyRequests],
            type: 'active',
          }),
        500,
      );
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorCreateBookRequest'));
    },
  });
};
