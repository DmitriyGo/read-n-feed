import {
  AdminReviewDto,
  BookRequestResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useVerifyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      typeOf,
      body,
    }: {
      requestId: string;
      typeOf: 'book' | 'file';
      body: AdminReviewDto;
    }) => {
      return await axiosSecure.post<BookRequestResponseDto>(
        (typeOf
          ? ApiRoute.BookRequests.Review
          : ApiRoute.FileRequestsAdmin.Review)(requestId),
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
