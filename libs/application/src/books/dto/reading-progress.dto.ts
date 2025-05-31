import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SaveReadingProgressDto {
  @ApiProperty({ description: 'The ID of the book being read' })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({
    description: 'Reading progress percentage (0-100)',
    example: 45.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 125 })
  @IsOptional()
  @IsNumber()
  pageNumber?: number;

  @ApiPropertyOptional({ description: 'Total pages in the book', example: 320 })
  @IsOptional()
  @IsNumber()
  totalPages?: number;

  @ApiPropertyOptional({
    description: 'Device identifier for syncing across devices',
    example: 'tablet-home',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Position in the document (e.g., EPUB CFI)',
    example: '/4/2[chapter1]/6/1:0',
  })
  @IsOptional()
  @IsString()
  position?: string;
}

export class ReadingProgressResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  bookId: string;

  @ApiProperty({ example: 45.5, description: 'Progress percentage (0-100)' })
  progress: number;

  @ApiPropertyOptional({ example: 125 })
  pageNumber?: number;

  @ApiPropertyOptional({ example: 320 })
  totalPages?: number;

  @ApiPropertyOptional({ example: 'tablet-home' })
  deviceId?: string;

  @ApiPropertyOptional({ example: '/4/2[chapter1]/6/1:0' })
  position?: string;

  @ApiProperty({ example: '2025-03-09T12:34:56.789Z' })
  updatedAt: Date;
}
