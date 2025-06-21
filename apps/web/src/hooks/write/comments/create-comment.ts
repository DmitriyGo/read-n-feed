import { CommentResponseDto, CreateCommentDto } from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      return axiosSecure.post<CommentResponseDto>(
        ApiRoute.Comments.Create,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.Comments.ForBook(variables.bookId)],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorCreateComment'));
    },
  });
};
