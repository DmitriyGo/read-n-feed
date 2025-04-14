import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookRequest, BookRequestStatus } from '@read-n-feed/domain';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

// Helper function to transform string inputs to arrays
const transformToArray = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

export class CreateBookRequestDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Short description or synopsis' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Publication date (YYYY-MM-DD)',
    example: '1925-04-10',
  })
  @IsDateString()
  @IsOptional()
  publicationDate?: string; // Will be converted to Date

  @ApiPropertyOptional({ description: 'Publisher name', example: 'Scribner' })
  @IsString()
  @IsOptional()
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Names of authors (for new authors)',
    type: [String],
    example: ['F. Scott Fitzgerald'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => transformToArray(value))
  authorNames?: string[];

  @ApiPropertyOptional({
    description: 'Names of genres',
    type: [String],
    example: ['Fiction', 'Classic'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => transformToArray(value))
  genreNames?: string[];

  @ApiPropertyOptional({
    description: 'Tags to associate with the book',
    type: [String],
    example: ['1920s', 'american-literature'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => transformToArray(value))
  tagLabels?: string[];

  @ApiPropertyOptional({
    description: 'Language of the book',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;

  // Required file information
  @ApiProperty({
    enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
    description: 'Format of the book file',
  })
  @IsEnum(['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'])
  @IsNotEmpty()
  fileFormat: string;

  @ApiPropertyOptional({
    description: 'Language of the file (if different from book language)',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  fileLanguage?: string;

  @ApiPropertyOptional({
    description: 'Custom display filename for the file',
    example: 'Война и мир.pdf',
  })
  @IsString()
  @IsOptional()
  filename?: string;

  // Note: The actual file will be handled by Multer as an uploaded file
}

export class UpdateBookRequestDto {
  @ApiPropertyOptional({ description: 'Title of the book', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Book description or synopsis' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Publication date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  publicationDate?: string; // Will be converted to Date

  @ApiPropertyOptional({ description: 'Publisher name' })
  @IsString()
  @IsOptional()
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Names of authors (for new authors)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  authorNames?: string[];

  @ApiPropertyOptional({
    description: 'Names of genres',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genreNames?: string[];

  @ApiPropertyOptional({
    description: 'Tags to associate with the book',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagLabels?: string[];

  @ApiPropertyOptional({ description: 'Admin notes (for internal use)' })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Language of the book',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;
}

export class AdminReviewDto {
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
    example: 'Book already exists in our system',
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

export class BookRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  coverImageUrl?: string | null;

  @ApiPropertyOptional()
  publicationDate?: Date | null;

  @ApiPropertyOptional()
  publisher?: string | null;

  @ApiPropertyOptional({ type: [String] })
  authorNames?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  genreNames?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  tagLabels?: string[] | null;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: BookRequestStatus;

  @ApiPropertyOptional()
  adminNotes?: string | null;

  @ApiPropertyOptional()
  rejectionReason?: string | null;

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
  resultingBookId?: string | null;

  @ApiPropertyOptional()
  language?: string | null;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  files?: any[] | null;
}

export class PaginatedBookRequestResponseDto {
  @ApiProperty({ type: [BookRequestResponseDto] })
  items: BookRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export function toBookRequestResponseDto(
  request: BookRequest,
  files?: any[],
): BookRequestResponseDto {
  const props = request.toPrimitives();
  return {
    ...props,
    files: files || null,
  };
}
