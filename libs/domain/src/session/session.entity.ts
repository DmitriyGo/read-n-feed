export interface SessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;

  // Metadata about the device or environment
  userAgent?: string | null;
  ipAddress?: string | null;

  // Expiration or revocation
  expiresAt: Date;
  revokedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

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

  /**
   * Revoke this session - sets revokedAt to 'now'.
   */
  revoke() {
    this.props.revokedAt = new Date();
  }

  /**
   * Check if session is currently valid (not revoked & not expired).
   */
  isActive(): boolean {
    const now = new Date();
    if (this.props.revokedAt) return false;
    if (this.props.expiresAt.getTime() <= now.getTime()) return false;
    return true;
  }

  /**
   * Update the refreshTokenHash (e.g., on rotation),
   * and optionally extend expiresAt or update metadata.
   */
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
