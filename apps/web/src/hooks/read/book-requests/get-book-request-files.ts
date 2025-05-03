import { BookFileResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useBookRequestFilesById = (id?: string, enabled = true) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.BookFiles.ForRequest(id || ''), accessToken],
    queryFn: async () => {
      if (!isDefined(id)) {
        return;
      }

      return axiosSecure.get<BookFileResponseDto[]>(
        ApiRoute.BookFiles.GetForBookRequest(id),
      );
    },
    enabled: isDefined(id) && enabled,
  });
};
