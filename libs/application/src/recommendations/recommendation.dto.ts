import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecommendationSource } from '@read-n-feed/domain';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

// DTOs for request parameters
export class GetRecommendationsQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  includeRead?: boolean;

  @ApiPropertyOptional({
    description: 'User age for age-appropriate content filtering',
  })
  @IsNumber()
  @IsOptional()
  age?: number;
}

export class GetSimilarBooksQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'User age for age-appropriate content filtering',
  })
  @IsNumber()
  @IsOptional()
  age?: number;
}

export class RecommendationFeedbackDto {
  @ApiProperty()
  @IsUUID()
  bookId: string;

  @ApiProperty()
  @IsBoolean()
  liked: boolean;
}

// DTOs for response data
export class BookDetailDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ type: [Object] })
  authors?: { id: string; name: string }[];

  @ApiPropertyOptional({ type: [Object] })
  genres?: { id: string; name: string }[];

  @ApiPropertyOptional({
    description:
      'Minimum age required to access this book (0 means no restriction)',
  })
  ageRestriction?: number;
}

export class BookRecommendationResponseDto {
  @ApiProperty()
  bookId: string;

  @ApiProperty()
  score: number;

  @ApiProperty({
    enum: [
      'GENRE_BASED',
      'AUTHOR_BASED',
      'TAG_BASED',
      'USER_HISTORY',
      'SIMILAR_USERS',
      'READING_PROGRESS',
      'TRENDING',
      'NEW_RELEASES',
      'EDITOR_CHOICE',
    ],
    isArray: true,
  })
  sources: RecommendationSource[];

  @ApiPropertyOptional()
  bookDetails?: BookDetailDto;
}

export class RecommendationGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({
    enum: [
      'GENRE_BASED',
      'AUTHOR_BASED',
      'TAG_BASED',
      'USER_HISTORY',
      'SIMILAR_USERS',
      'READING_PROGRESS',
      'TRENDING',
      'NEW_RELEASES',
      'EDITOR_CHOICE',
    ],
  })
  source: RecommendationSource;

  @ApiProperty({ type: [BookRecommendationResponseDto] })
  books: BookRecommendationResponseDto[];
}

export class PersonalizedRecommendationsResponseDto {
  @ApiProperty()
  forYou: RecommendationGroupResponseDto;

  @ApiProperty()
  trending: RecommendationGroupResponseDto;

  @ApiPropertyOptional()
  basedOnGenres?: RecommendationGroupResponseDto;

  @ApiPropertyOptional()
  basedOnAuthors?: RecommendationGroupResponseDto;

  @ApiPropertyOptional()
  newReleases?: RecommendationGroupResponseDto;

  @ApiPropertyOptional()
  continueReading?: RecommendationGroupResponseDto;
}

export class SimilarBooksResponseDto {
  @ApiProperty()
  originalBookId: string;

  @ApiPropertyOptional()
  originalBookTitle?: string;

  @ApiProperty({ type: [BookRecommendationResponseDto] })
  recommendations: BookRecommendationResponseDto[];
}
