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

  username?: string | null;
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

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get provider(): Provider {
    return this.props.provider;
  }

  blockUser() {
    this.props.isBlocked = true;
  }

  unblockUser() {
    this.props.isBlocked = false;
  }

  updateProfile(partial: Partial<UserProps>) {
    this.props.firstName = partial.firstName ?? this.props.firstName;
    this.props.lastName = partial.lastName ?? this.props.lastName;
    this.props.avatarUrl = partial.avatarUrl ?? this.props.avatarUrl;

    this.props.updatedAt = new Date();
  }

  toPrimitives(): UserProps {
    return { ...this.props };
  }
}
