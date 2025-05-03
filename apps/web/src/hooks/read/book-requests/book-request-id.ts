import { BookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useBookRequestById = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.BookRequests.Details(id), accessToken],
    queryFn: async () => {
      return axiosSecure.get<BookRequestResponseDto>(
        ApiRoute.BookRequests.Id(id),
      );
    },
    enabled: isDefined(accessToken) && enabled,
  });
};
