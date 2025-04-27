import { PaginatedBookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { AcceptedStatus, ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure, clearObject } from '@/lib';

export const useAdminBookRequests = (data: {
  page: number;
  limit: number;
  status?: AcceptedStatus;
  title?: string;
}) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(clearObject(data));

  return useQuery({
    queryKey: [
      QueryKey.GetAdminBookRequests,
      accessToken,
      urlParams.toString(),
    ],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookRequestResponseDto>(
        `${ApiRoute.BookRequests.GetAll}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
