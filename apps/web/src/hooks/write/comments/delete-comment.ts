import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useDeleteComment = (commentId: string, bookId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      return axiosSecure.delete(ApiRoute.Comments.Delete(commentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Comments.ForBook(bookId)],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorDeleteComment'));
    },
  });
};
