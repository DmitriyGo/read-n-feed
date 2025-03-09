import {
  PaginatedBooksResponseDto,
  SearchBooksDto,
} from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure, clearObject } from '@/lib';

export const useGetFilteredBooks = (searchData: SearchBooksDto) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(clearObject(searchData));

  return useQuery({
    queryKey: [QueryKey.GetBooksCatalog, accessToken, ...urlParams.values()],
    queryFn: async () => {
      return axiosSecure.get<PaginatedBooksResponseDto>(
        `${ApiRoute.Books.Base}?${urlParams}`,
      );
    },
  });
};
