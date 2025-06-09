import { UserRole } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';

import { useAuth } from '@/hooks';

export const useHasRole = (userRole: UserRole) => {
  const { isReady, user } = useAuth();

  return {
    isReady,
    hasRole:
      isDefined(user) && isDefined(user.roles)
        ? user.roles.some((role) => role === userRole)
        : false,
    isLoadingOrRefetching: false, // Since we're getting user from store, no loading state
  };
};
