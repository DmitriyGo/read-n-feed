import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookImageRequest, BookImageRequestStatus } from '@read-n-feed/domain';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookImageRequestDto {
  @ApiProperty({ description: 'The ID of the book to add/update an image for' })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiPropertyOptional({ description: 'The URL of the image (if already uploaded)' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the admin' })
  @IsString()
  @IsOptional()
  notes?: string;

  // Note: The image file itself will be handled by Multer as an uploaded file
}

export class AdminReviewBookImageRequestDto {
  @ApiProperty({
    enum: ['APPROVED', 'REJECTED'],
    description: 'New status for the request',
    example: 'APPROVED',
  })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if status is REJECTED)',
    example: 'Image quality too low',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Admin notes (for internal use)',
    example: 'Verified with publisher, good to go',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class BookImageRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: BookImageRequestStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date | null;

  @ApiPropertyOptional()
  rejectedAt?: Date | null;

  @ApiPropertyOptional()
  approvedBy?: string | null;

  @ApiPropertyOptional()
  rejectedBy?: string | null;

  @ApiPropertyOptional()
  rejectionReason?: string | null;

  @ApiPropertyOptional()
  adminNotes?: string | null;

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      title: { type: 'string' },
      coverImageUrl: { type: 'string', nullable: true },
    },
    additionalProperties: false,
  })
  bookInfo?: {
    title: string;
    coverImageUrl?: string | null;
  } | null;
}

export class PaginatedBookImageRequestResponseDto {
  @ApiProperty({ type: [BookImageRequestResponseDto] })
  items: BookImageRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export function toBookImageRequestResponseDto(
  request: BookImageRequest,
  bookInfo?: { title: string; coverImageUrl?: string | null } | null,
): BookImageRequestResponseDto {
  const props = request.toPrimitives();
  return {
    ...props,
    bookInfo: bookInfo || null,
  };
}
