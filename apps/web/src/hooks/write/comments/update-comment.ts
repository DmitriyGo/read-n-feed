import { CommentResponseDto, UpdateCommentDto } from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { axiosSecure } from '@/lib/axios';

export const useUpdateComment = (commentId: string, bookId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommentDto) => {
      return axiosSecure.put<CommentResponseDto>(
        ApiRoute.Comments.Update(commentId),
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'book', bookId],
      });
    },
  });
};
