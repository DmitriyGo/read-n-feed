import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Provider,
  SubscriptionPlan,
  UserRole,
  User,
} from '@read-n-feed/domain';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/me.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'bdc5f0f3-5c3e-4fc6-8e4d-6902e1a141c7' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'LOCAL' })
  provider: Provider;

  @ApiProperty({ example: ['USER'], isArray: true })
  roles: UserRole[];

  @ApiProperty({ example: false })
  isBlocked: boolean;

  @ApiPropertyOptional({ example: 'john' })
  username?: string | null;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/me.png' })
  avatarUrl?: string | null;

  @ApiProperty({ example: 'FREE' })
  subscriptionPlan: SubscriptionPlan;

  @ApiPropertyOptional()
  subscriptionExpiresAt?: Date | null;

  @ApiPropertyOptional()
  preferredLanguage?: string | null;

  @ApiPropertyOptional({ example: ['EPUB', 'PDF'] })
  preferredReadingFormats?: string[];

  @ApiPropertyOptional()
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  const props = user.toPrimitives();
  return {
    id: props.id,
    email: props.email,
    provider: props.provider,
    roles: props.roles,
    isBlocked: props.isBlocked,
    username: props.username,
    firstName: props.firstName,
    lastName: props.lastName,
    avatarUrl: props.avatarUrl,
    subscriptionPlan: props.subscriptionPlan,
    subscriptionExpiresAt: props.subscriptionExpiresAt,
    preferredLanguage: props.preferredLanguage,
    preferredReadingFormats: props.preferredReadingFormats,
    metadata: props.metadata,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}
