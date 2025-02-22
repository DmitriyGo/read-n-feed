export interface SessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;

  // Metadata about the device or environment
  userAgent?: string | null;
  ipAddress?: string | null;

  locationMetadata?: string | null;
  deviceType?: string | null;

  // Expiration or revocation
  expiresAt: Date;
  revokedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
