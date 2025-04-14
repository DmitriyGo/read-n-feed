import { PaginatedBookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { AcceptedStatus, ApiRoute } from '@/constants';
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
  status?: AcceptedStatus;
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
    queryKey: [QueryKey.GetMyBookRequests, accessToken, urlParams.toString()],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookRequestResponseDto>(
        `${ApiRoute.BookRequests.GetAll}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
