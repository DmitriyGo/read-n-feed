import { SessionProps } from './session.props';

export class Session {
  private props: SessionProps;

  constructor(props: SessionProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get refreshTokenHash(): string {
    return this.props.refreshTokenHash;
  }

  get userAgent(): string | null | undefined {
    return this.props.userAgent;
  }

  get ipAddress(): string | null | undefined {
    return this.props.ipAddress;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null | undefined {
    return this.props.revokedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get locationMetadata(): string | null | undefined {
    return this.props.locationMetadata;
  }

  get deviceType(): string | null | undefined {
    return this.props.deviceType;
  }

  revoke() {
    this.props.revokedAt = new Date();
  }

  isActive(): boolean {
    const now = new Date();
    if (this.props.revokedAt) return false;
    if (this.props.expiresAt.getTime() <= now.getTime()) return false;
    return true;
  }

  rotateToken(newHash: string, newExpiresAt?: Date) {
    this.props.refreshTokenHash = newHash;
    if (newExpiresAt) {
      this.props.expiresAt = newExpiresAt;
    }
    this.props.updatedAt = new Date();
  }

  toPrimitives(): SessionProps {
    return { ...this.props };
  }
}
