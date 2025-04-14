import { PaginatedBookRequestResponseDto } from '@read-n-feed/application';
import { BookRequestStatus } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure, clearObject } from '@/lib';

export const useMyBookRequests = (data: {
  page?: number;
  limit?: number;
  status?: BookRequestStatus;
}) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(clearObject(data));

  return useQuery({
    queryKey: [QueryKey.GetBookRequests, accessToken, urlParams.toString()],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookRequestResponseDto>(
        `${ApiRoute.BookRequests.MyRequests}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
