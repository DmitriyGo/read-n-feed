import { BookResponseDto } from '@read-n-feed/application';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../use-auth';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { axiosSecure } from '@/lib';

export const useGetFavouriteBooks = () => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [QueryKey.Books.Favoured, accessToken],
    queryFn: async () => {
      return axiosSecure.get<BookResponseDto[]>(ApiRoute.Books.Favorites);
    },
  });
};
