import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string; bookId: string }) => {
      return axiosSecure.delete(ApiRoute.BookFiles.Delete(fileId));
    },
    onSuccess: (_, { fileId, bookId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.BookFiles.ForBook(bookId)],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorDeleteFile'));
    },
  });
};
