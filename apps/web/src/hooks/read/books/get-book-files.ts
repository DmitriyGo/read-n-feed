import { BookFileResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useBookFilesById = (id?: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.GetBookFiles, accessToken, id],
    queryFn: async () => {
      if (!isDefined(id)) {
        return;
      }

      return axiosSecure.get<BookFileResponseDto[]>(
        ApiRoute.BookFiles.GetForBook(id),
      );
    },
    enabled: isDefined(id),
  });
};
