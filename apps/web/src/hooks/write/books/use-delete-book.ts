import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      return axiosSecure.delete(ApiRoute.Books.Id(bookId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Books.Catalog],
      });
    },
  });
};
