import { PaginatedBookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useMyBookRequests = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetBookRequests, accessToken],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBookRequestResponseDto>(
        ApiRoute.Requests.MyRequests,
      );
    },
    enabled: isDefined(accessToken),
  });
};
