import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookFileRequest, BookFileRequestStatus } from '@read-n-feed/domain';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookFileRequestDto {
  @ApiProperty({ description: 'The ID of the book to add a file for' })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({
    enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
    description: 'Format of the book file to be added',
  })
  @IsEnum(['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'])
  @IsNotEmpty()
  format: string;

  @ApiPropertyOptional({ description: 'Additional notes for the admin' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Custom display filename for the file',
    example: 'Кобзар.pdf',
  })
  @IsString()
  @IsOptional()
  filename?: string;

  // Note: The file itself will be handled by Multer as an uploaded file
}

export class AdminReviewBookFileRequestDto {
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
    example: 'File format not supported',
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

export class BookFileRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  fileId?: string | null;

  @ApiProperty()
  format: string;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: BookFileRequestStatus;

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

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        description: 'Custom or original filename of the file',
        example: 'Война и мир.pdf',
      },
      fileSize: { type: 'number' },
      mimeType: { type: 'string' },
    },
    additionalProperties: false,
  })
  fileInfo?: {
    filename: string;
    fileSize: number;
    mimeType: string;
  } | null;
}

export class PaginatedBookFileRequestResponseDto {
  @ApiProperty({ type: [BookFileRequestResponseDto] })
  items: BookFileRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export function toBookFileRequestResponseDto(
  request: BookFileRequest,
  bookInfo?: { title: string; coverImageUrl?: string | null } | null,
  fileInfo?: { filename: string; fileSize: number; mimeType: string } | null,
): BookFileRequestResponseDto {
  const props = request.toPrimitives();
  return {
    ...props,
    bookInfo: bookInfo || null,
    fileInfo: fileInfo || null,
  };
}
