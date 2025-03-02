// libs/application/src/books/dto/book-like.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class BookLikeResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the current user has liked the book',
  })
  liked: boolean;
}

export class BookLikesCountDto {
  @ApiProperty({
    example: 42,
    description: 'Total number of likes for the book',
  })
  count: number;
}

export function toBookLikeResponseDto(): BookLikeResponseDto {
  return {
    liked: true, // If a BookLike entity exists, it means the user has liked the book
  };
}
