import { UserRole } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';

import { useAuth } from '@/hooks';
import { useGetProfile } from '@/hooks/read';

export const useHasRole = (userRole: UserRole) => {
  const { isReady } = useAuth();
  const { data: profile, isLoading, isRefetching } = useGetProfile();
  const isLoadingOrRefetching = isLoading || isRefetching;

  return {
    isReady,
    hasRole:
      isDefined(profile) && isDefined(profile.data.roles)
        ? profile.data.roles.some((role) => role === userRole)
        : false,
    isLoadingOrRefetching,
  };
};
