import { PaginatedBookRequestResponseDto } from '@read-n-feed/application';
import { BookRequestStatus } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure, clearObject } from '@/lib';

export const useAdminBookRequests = ({
  limit,
  page,
  status,
  title,
}: {
  page: number;
  limit: number;
  status?: BookRequestStatus;
  title?: string;
}) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(
    clearObject({
      page,
      limit,
      status,
      title,
    }),
  );

  return useQuery({
    queryKey: [QueryKey.GetBookRequests, accessToken, urlParams.toString()],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookRequestResponseDto>(
        `${ApiRoute.Requests.GetAll}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
