import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUrl,
  IsPositive,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: 'The title of the book', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Short description or synopsis' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Publication date (YYYY-MM-DD)' })
  @IsOptional()
  publicationDate?: Date | null;

  @ApiPropertyOptional({ description: 'Publisher name' })
  @IsOptional()
  @IsString()
  publisher?: string | null;

  @ApiPropertyOptional({ description: 'Average rating (1-5 or custom scale)' })
  @IsOptional()
  @IsNumber()
  averageRating?: number | null;
}

export class UpdateBookDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publicationDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  averageRating?: number | null;

  @ApiPropertyOptional({ description: 'Update total likes' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  totalLikes?: number;
}

export class SearchBooksDto {
  @ApiPropertyOptional({ description: 'Partial title match' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Author name for partial match' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ description: 'Genre name for exact match' })
  @IsOptional()
  @IsString()
  genreName?: string;

  @ApiPropertyOptional({ description: 'Tag label for exact match' })
  @IsOptional()
  @IsString()
  tagName?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field: title | createdAt | publicationDate',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'createdAt' | 'publicationDate' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order: asc | desc',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class BookResponseDto {
  @ApiProperty()
  id: string;

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

  @ApiPropertyOptional()
  averageRating?: number | null;

  @ApiPropertyOptional()
  totalLikes?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
