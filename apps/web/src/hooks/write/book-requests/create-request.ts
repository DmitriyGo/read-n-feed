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
    mutationFn: async (data: CreateBookRequestDto) => {
      await axiosSecure.post<BookRequestResponseDto>(
        ApiRoute.Requests.Create,
        data,
      );
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.GetBookRequests],
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
