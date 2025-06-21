import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      return axiosSecure.delete(ApiRoute.Books.Id(bookId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Catalog],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorDeleteBook'));
    },
  });
};
