import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useLikeBook = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      bookId,
      userWantsToLike,
    }: {
      userWantsToLike: boolean;
      bookId: string;
    }) => {
      if (userWantsToLike) {
        return axiosSecure.post(ApiRoute.Books.Like(bookId));
      } else {
        return axiosSecure.delete(ApiRoute.Books.Unlike(bookId));
      }
    },
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Details(bookId)],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Liked],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorLikeBook'));
    },
  });
};
