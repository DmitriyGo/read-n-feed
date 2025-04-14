import {
  BookRequestResponseDto,
  UpdateBookRequestDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useUpdateBookRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dto,
      id,
    }: {
      dto: UpdateBookRequestDto;
      id: string;
    }) => {
      await axiosSecure.patch<BookRequestResponseDto>(
        ApiRoute.BookRequests.Update(id),
        dto,
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
