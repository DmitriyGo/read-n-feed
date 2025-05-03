import { CommentResponseDto } from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosBase } from '@/lib/axios';

export const useCommentsForBook = (bookId?: string) => {
  return useQuery({
    queryKey: [QueryKey.Comments.ForBook(bookId || '')],
    queryFn: async () => {
      if (!bookId) return { data: [] };
      return axiosBase.get<CommentResponseDto[]>(
        ApiRoute.Comments.GetForBook(bookId),
      );
    },
    enabled: !!bookId,
  });
};
