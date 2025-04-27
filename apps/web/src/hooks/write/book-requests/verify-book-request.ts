import {
  AdminReviewDto,
  BookRequestResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useVerifyBookRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      body,
    }: {
      requestId: string;
      body: AdminReviewDto;
    }) => {
      return await axiosSecure.post<BookRequestResponseDto>(
        ApiRoute.BookRequests.Review(requestId),
        body,
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

      toast.success('Book request verified successfully');
    },
    onError: (error) => {
      toast.error(String(error));
      console.error(error);
    },
  });
};
