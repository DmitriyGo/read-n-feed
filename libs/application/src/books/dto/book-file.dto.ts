import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookFile } from '@read-n-feed/domain';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export enum BookFormatDto {
  PDF = 'PDF',
  EPUB = 'EPUB',
  FB2 = 'FB2',
  MOBI = 'MOBI',
  AZW3 = 'AZW3',
}

export class CreateBookFileDto {
  @ApiProperty({ description: 'The ID of the book this file belongs to' })
  @IsUUID()
  bookId: string;

  @ApiProperty({
    enum: BookFormatDto,
    description: 'Format of the book file',
  })
  @IsEnum(BookFormatDto)
  format: BookFormatDto;

  @ApiPropertyOptional({ description: 'Size of the file in bytes' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Original filename' })
  @IsOptional()
  @IsString()
  originalFilename?: string;
}

export class BookFileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  bookId: string;

  @ApiProperty({ enum: BookFormatDto, example: 'PDF' })
  format: string;

  @ApiPropertyOptional({ example: 2048576 })
  fileSize?: number | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

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
    format: props.format,
    fileSize: props.fileSize,
    createdAt: props.createdAt,
  };

  if (includeUrl && url) {
    response.downloadUrl = url;
  }

  return response;
}
