import {
  AdminReviewDto,
  BookFileRequestResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useVerifyFileRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      body,
    }: {
      requestId: string;
      body: AdminReviewDto;
    }) => {
      return await axiosSecure.post<BookFileRequestResponseDto>(
        ApiRoute.FileRequestsAdmin.Review(requestId),
        body,
      );
    },
    onSuccess: () => {
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [QueryKey.GetMyFileRequests],
            type: 'active',
          }),
        500,
      );

      toast.success('file request verified successfully');
    },
    onError: (error) => {
      toast.error(String(error));
      console.error(error);
    },
  });
};
