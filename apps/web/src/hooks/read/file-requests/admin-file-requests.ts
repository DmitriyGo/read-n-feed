import { PaginatedBookFileRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { AcceptedStatus, ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure, clearObject } from '@/lib';

export const useAdminFileRequests = (data: {
  page?: number;
  limit?: number;
  status?: AcceptedStatus;
  bookId?: string;
}) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(clearObject(data));

  return useQuery({
    queryKey: [
      QueryKey.GetAdminFileRequests,
      accessToken,
      urlParams.toString(),
    ],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookFileRequestResponseDto>(
        `${ApiRoute.FileRequestsAdmin.GetAll}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
