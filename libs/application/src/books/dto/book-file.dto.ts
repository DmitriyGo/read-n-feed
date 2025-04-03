import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookFile } from '@read-n-feed/domain';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum BookFormatDto {
  PDF = 'PDF',
  EPUB = 'EPUB',
  FB2 = 'FB2',
  MOBI = 'MOBI',
  AZW3 = 'AZW3',
}

export class CreateBookFileDto {
  @ApiPropertyOptional({
    description:
      'The ID of the book this file belongs to. Either bookId or bookRequestId must be provided',
  })
  @IsUUID()
  @IsOptional()
  bookId?: string;

  @ApiPropertyOptional({
    description:
      'The ID of the book request this file belongs to. Either bookId or bookRequestId must be provided',
  })
  @IsUUID()
  @IsOptional()
  bookRequestId?: string;

  @ApiProperty({
    enum: BookFormatDto,
    description: 'Format of the book file',
  })
  @IsEnum(BookFormatDto)
  format: BookFormatDto;

  @ApiPropertyOptional({
    description: 'Custom display filename for the file',
    example: 'Война и мир.pdf',
  })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the file',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BookFileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  bookId?: string | null;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  bookRequestId?: string | null;

  @ApiProperty({ enum: BookFormatDto, example: 'PDF' })
  format: string;

  @ApiPropertyOptional({ example: 2048576 })
  fileSize?: number | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: 'original-filename.pdf' })
  filename?: string | null;

  @ApiPropertyOptional({ example: 'application/pdf' })
  mimeType?: string | null;

  @ApiPropertyOptional({ example: true })
  isValidated?: boolean;

  @ApiPropertyOptional({
    example: { title: 'Book title', author: 'Book author', pageCount: 320 },
  })
  metadata?: Record<string, any> | null;

  @ApiPropertyOptional({ example: 'https://example.com/files/book.pdf' })
  downloadUrl?: string;
}

export function toBookFileResponseDto(
  bookFile: BookFile,
  includeUrl = false,
  url?: string,
): BookFileResponseDto {
  const props = bookFile.toPrimitives();

  const response: BookFileResponseDto = {
    id: props.id,
    bookId: props.bookId,
    bookRequestId: props.bookRequestId,
    format: props.format,
    fileSize: props.fileSize,
    createdAt: props.createdAt,
    filename: props.filename,
    mimeType: props.mimeType,
    isValidated: props.isValidated,
    metadata: props.metadata,
  };

  if (includeUrl && url) {
    response.downloadUrl = url;
  }

  return response;
}
