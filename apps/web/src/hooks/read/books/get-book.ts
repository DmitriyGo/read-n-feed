import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure } from '@/lib';

export const useBookById = (id?: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetBookById, id, accessToken],
    queryFn: async () => {
      if (!isDefined(id)) {
        return;
      }

      return axiosSecure.get<BookResponseDto>(ApiRoute.Books.Id(id));
    },
    enabled: isDefined(id),
  });
};
