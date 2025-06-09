export type Provider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'GITHUB';
export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'PLUS' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  provider: Provider;
  roles: UserRole[];
  isBlocked: boolean;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  age?: number | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: Date | null;
  preferredLanguage?: string | null;
  preferredReadingFormats?: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  age?: number;
}

export interface AuthTokens {
  accessToken: string;
}

export interface Session {
  id: string;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceType?: string | null;
  locationMetadata?: string | null;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  age?: number;
}
