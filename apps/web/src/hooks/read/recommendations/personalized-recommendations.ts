import {
  GetRecommendationsQueryDto,
  PersonalizedRecommendationsResponseDto,
} from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useQuery } from '@tanstack/react-query';

import { ApiRoute } from '@/constants';
import { QueryKey } from '@/constants/query-key';
import { useAuth } from '@/hooks/use-auth';
import { axiosSecure, clearObject } from '@/lib';

export const usePersonalizedRecommendations = ({
  limit = 10,
  includeRead,
}: GetRecommendationsQueryDto) => {
  const { accessToken } = useAuth();

  const urlParams = new URLSearchParams(
    clearObject({
      limit,
      includeRead,
    }),
  );

  return useQuery({
    queryKey: [QueryKey.Recommendations, accessToken, urlParams.toString()],
    queryFn: async () => {
      return axiosSecure.get<PersonalizedRecommendationsResponseDto>(
        `${ApiRoute.Recommendations.GetPersonalized}?${urlParams}`,
      );
    },
    enabled: isDefined(accessToken),
  });
};
