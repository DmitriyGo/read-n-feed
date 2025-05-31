import { BookFileResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosBase } from '@/lib';

export const useBookFilesById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [QueryKey.BookFiles.ForBook(id)],
    queryFn: async () => {
      if (!isDefined(id)) {
        return;
      }

      return axiosBase.get<BookFileResponseDto[]>(
        ApiRoute.BookFiles.GetForBook(id),
      );
    },
    enabled: isDefined(id) && enabled,
  });
};
