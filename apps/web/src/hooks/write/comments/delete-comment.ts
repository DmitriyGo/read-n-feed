import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib/axios';

export const useDeleteComment = (commentId: string, bookId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return axiosSecure.delete(ApiRoute.Comments.Delete(commentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'book', bookId],
      });
    },
  });
};
