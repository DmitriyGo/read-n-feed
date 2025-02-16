import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Session } from '@read-n-feed/domain';

export class SessionResponseDto {
  @ApiProperty({ example: '2b0b9a3a-4543-41f4-a662-df05ef738bf7' })
  id: string;

  @ApiProperty({ example: '76d29eb0-dc7f-439f-b917-94c756fdb2cb' })
  userId: string;

  @ApiPropertyOptional({
    example:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  })
  userAgent?: string | null;

  @ApiPropertyOptional({ example: '::1' })
  ipAddress?: string | null;

  @ApiPropertyOptional({
    example: 'Device: desktop, Browser: Chrome 133.0.0.0, OS: macOS 10.15.7',
  })
  deviceType?: string | null;

  @ApiPropertyOptional({ example: 'New York, USA' })
  locationMetadata?: string | null;

  @ApiProperty({ example: '2025-03-18T14:16:46.765Z' })
  expiresAt: Date;

  @ApiPropertyOptional({ example: null })
  revokedAt?: Date | null;

  @ApiProperty({ example: '2025-02-16T14:16:46.815Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-02-16T14:16:46.815Z' })
  updatedAt: Date;
}

export function toSessionResponseDto(session: Session): SessionResponseDto {
  const props = session.toPrimitives();
  return {
    id: props.id,
    userId: props.userId,
    userAgent: props.userAgent,
    ipAddress: props.ipAddress,
    deviceType: props.deviceType,
    locationMetadata: props.locationMetadata,
    expiresAt: props.expiresAt,
    revokedAt: props.revokedAt,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}
