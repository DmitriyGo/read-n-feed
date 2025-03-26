import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useBookById = (id?: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetBooksCatalog, accessToken, id],
    queryFn: async () => {
      if (!isDefined(id)) {
        return;
      }

      return axiosSecure.get<BookResponseDto>(ApiRoute.Books.Id(id));
    },
    enabled: isDefined(id),
  });
};
