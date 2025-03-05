import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { BookResponseDto } from './book.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedBooksResponseDto extends PaginatedResponseDto<BookResponseDto> {
  @ApiProperty({
    type: [BookResponseDto],
    description: 'Array of books for the current page',
  })
  @Type(() => BookResponseDto)
  override items: BookResponseDto[];
}
