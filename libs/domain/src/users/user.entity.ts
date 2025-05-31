import { UserProps } from './user.props';

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

  get provider() {
    return this.props.provider;
  }

  get roles() {
    return this.props.roles;
  }

  get isBlocked() {
    return this.props.isBlocked;
  }

  get age() {
    return this.props.age;
  }

  blockUser() {
    this.props.isBlocked = true;
    this.props.updatedAt = new Date();
  }

  unblockUser() {
    this.props.isBlocked = false;
    this.props.updatedAt = new Date();
  }

  updateProfile(partial: Partial<UserProps>) {
    this.props.username = partial.username ?? this.props.username;
    this.props.firstName = partial.firstName ?? this.props.firstName;
    this.props.lastName = partial.lastName ?? this.props.lastName;
    this.props.avatarUrl = partial.avatarUrl ?? this.props.avatarUrl;
    this.props.preferredLanguage =
      partial.preferredLanguage ?? this.props.preferredLanguage;
    this.props.preferredReadingFormats =
      partial.preferredReadingFormats ?? this.props.preferredReadingFormats;
    this.props.metadata = partial.metadata ?? this.props.metadata;
    if (partial.age !== undefined) this.props.age = partial.age;
    this.props.updatedAt = new Date();
  }

  setSubscription(plan: UserProps['subscriptionPlan'], expiresAt?: Date) {
    this.props.subscriptionPlan = plan;
    this.props.subscriptionExpiresAt = expiresAt ?? null;
    this.props.updatedAt = new Date();
  }

  toPrimitives(): UserProps {
    return { ...this.props };
  }
}
