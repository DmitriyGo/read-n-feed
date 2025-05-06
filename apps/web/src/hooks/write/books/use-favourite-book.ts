import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useFavouriteBook = () => {
  const queryClient = useQueryClient();

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
    },
  });
};
