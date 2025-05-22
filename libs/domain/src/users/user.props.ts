export type Provider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'GITHUB';

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

export type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'PLUS' | 'ENTERPRISE';

export interface UserProps {
  id: string;
  email: string;
  password?: string | null;
  provider: Provider;
  roles: UserRole[];
  isBlocked: boolean;
  age?: number | null;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: Date | null;
  preferredLanguage?: string | null;
  preferredReadingFormats?: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
