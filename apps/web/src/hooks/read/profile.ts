import { UserProps } from '@read-n-feed/domain';
import { useQuery } from '@tanstack/react-query';

import { delay } from '@/lib';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProps> => {
      await delay(1000);

      return {
        id: '1',
        email: 'johndoe@gmail.com',
        createdAt: new Date(),
        isBlocked: false,
        provider: 'LOCAL',
        roles: ['USER'],
        subscriptionPlan: 'FREE',
        updatedAt: new Date(),
        avatarUrl: 'https://avatars.githubusercontent.com/u/14010285?v=4',
        firstName: 'John',
        lastName: 'Doe',
        metadata: {},
        preferredLanguage: 'en',
        password: null,
        preferredReadingFormats: [],
        subscriptionExpiresAt: null,
        username: 'john_doe',
      };
    },
  });
};
