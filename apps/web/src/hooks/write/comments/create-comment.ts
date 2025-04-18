import { CommentResponseDto, CreateCommentDto } from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib/axios';

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      return axiosSecure.post<CommentResponseDto>(
        ApiRoute.Comments.Create,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'book', variables.bookId],
      });
    },
  });
};
