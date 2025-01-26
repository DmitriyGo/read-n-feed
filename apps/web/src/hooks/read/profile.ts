import { UserProps } from '@read-n-feed/domain';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { axiosSecure, delay } from '@/lib';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      await delay(1000);

      return axiosSecure.get<UserProps>(ApiRoute.Users.Me);
    },
  });
};
