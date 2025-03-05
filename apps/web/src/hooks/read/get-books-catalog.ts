import { BookResponseDto, SearchBooksDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure, clearObject } from '@/lib';

export const useGetFilteredBooks = (searchData: SearchBooksDto) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(clearObject(searchData));

  return useQuery({
    queryKey: [QueryKey.GetBooksCatalog, accessToken],
    queryFn: async () => {
      return axiosSecure.get<BookResponseDto[]>(
        `${ApiRoute.Books.Base}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
