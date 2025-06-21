import {
  AdminReviewDto,
  BookRequestResponseDto,
} from '@read-n-feed/application';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useVerifyRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
        (typeOf === 'book'
          ? ApiRoute.BookRequests.Review
          : ApiRoute.FileRequestsAdmin.Review)(requestId),
        body,
      );
    },
    onSuccess: (_, { requestId }) => {
      setTimeout(() => {
        // More specific invalidation based on request type
        queryClient.invalidateQueries({
          queryKey: [QueryKey.BookRequests.All],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.BookRequests.MyRequests],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.FileRequests.All],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.FileRequests.MyRequests],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.Books.Catalog],
        });

        // Invalidate specific request details
        queryClient.invalidateQueries({
          queryKey: [QueryKey.BookRequests.Details(requestId)],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.FileRequests.Details(requestId)],
        });
      }, 500);

      toast.success(t('requestVerifiedSuccessfully'));
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('errorVerifyRequest'));
    },
  });
};
