import {
  BookRequestResponseDto,
  CreateBookRequestDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useCreateBookRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookRequestDto & { file: File }) => {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (key !== 'file' && value) {
          formData.append(key, String(value));
        }
      }

      formData.append('file', data.file);

      return await axiosSecure.post<BookRequestResponseDto>(
        ApiRoute.BookRequests.Create,
        formData,
      );
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.GetMyBookRequests],
            type: 'active',
          }),
        500,
      );
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
