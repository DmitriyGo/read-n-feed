import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib/axios';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string; bookId: string }) => {
      return axiosSecure.delete(ApiRoute.BookFiles.Delete(fileId));
    },
    onSuccess: (_, { fileId, bookId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.BookFiles.ForBook(bookId)],
      });
    },
  });
};
