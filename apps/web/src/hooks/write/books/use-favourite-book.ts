import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useFavouriteBook = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      bookId,
      userWantsToFavourite,
    }: {
      userWantsToFavourite: boolean;
      bookId: string;
    }) => {
      if (userWantsToFavourite) {
        return axiosSecure.post(ApiRoute.Books.Favorite(bookId));
      } else {
        return axiosSecure.delete(ApiRoute.Books.Unfavorite(bookId));
      }
    },
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Details(bookId)],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Favoured],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorFavouriteBook'));
    },
  });
};
