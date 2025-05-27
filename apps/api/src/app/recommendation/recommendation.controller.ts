import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  RecommendationUseCase,
  GetRecommendationsQueryDto,
  GetSimilarBooksQueryDto,
  RecommendationFeedbackDto,
  PersonalizedRecommendationsResponseDto,
  SimilarBooksResponseDto,
  RecommendationGroupResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { Public } from '../auth/guards/public.decorator';

@ApiBearerAuth()
@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationUseCase: RecommendationUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get personalized recommendations for the current user',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeRead', required: false, type: Boolean })
  @ApiQuery({
    name: 'age',
    required: false,
    type: Number,
    description: 'User age for age-appropriate content filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns personalized recommendations for the user',
    type: PersonalizedRecommendationsResponseDto,
  })
  async getPersonalizedRecommendations(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetRecommendationsQueryDto,
  ): Promise<PersonalizedRecommendationsResponseDto> {
    return this.recommendationUseCase.getPersonalizedRecommendations(user.id, {
      limit: query.limit,
      includeRead: query.includeRead,
      age: query.age,
    });
  }

  @Get('similar/:bookId')
  @Public()
  @ApiOperation({ summary: 'Get similar books to a specific book' })
  @ApiParam({
    name: 'bookId',
    description: 'Book ID to find similar books for',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'age',
    required: false,
    type: Number,
    description: 'User age for age-appropriate content filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns books similar to the specified book',
    type: SimilarBooksResponseDto,
  })
  async getSimilarBooks(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query() query: GetSimilarBooksQueryDto,
  ): Promise<SimilarBooksResponseDto> {
    return this.recommendationUseCase.getSimilarBooks(
      bookId,
      query.limit,
      query.age,
    );
  }

  @Get('genre/:genreId')
  @Public()
  @ApiOperation({ summary: 'Get recommendations for a specific genre' })
  @ApiParam({
    name: 'genreId',
    description: 'Genre ID to get recommendations for',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'age',
    required: false,
    type: Number,
    description: 'User age for age-appropriate content filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns recommended books for the specified genre',
    type: RecommendationGroupResponseDto,
  })
  async getRecommendationsByGenre(
    @Param('genreId', ParseUUIDPipe) genreId: string,
    @Query('limit') limit?: number,
    @Query('age') age?: number,
  ): Promise<RecommendationGroupResponseDto> {
    return this.recommendationUseCase.getRecommendationsByGenre(
      genreId,
      limit,
      age,
    );
  }

  @Get('author/:authorId')
  @Public()
  @ApiOperation({ summary: 'Get recommendations for a specific author' })
  @ApiParam({
    name: 'authorId',
    description: 'Author ID to get recommendations for',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'age',
    required: false,
    type: Number,
    description: 'User age for age-appropriate content filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns recommended books for the specified author',
    type: RecommendationGroupResponseDto,
  })
  async getRecommendationsByAuthor(
    @Param('authorId', ParseUUIDPipe) authorId: string,
    @Query('limit') limit?: number,
    @Query('age') age?: number,
  ): Promise<RecommendationGroupResponseDto> {
    return this.recommendationUseCase.getRecommendationsByAuthor(
      authorId,
      limit,
      age,
    );
  }

  @Post('feedback')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Save user feedback about a recommendation' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Feedback saved successfully',
  })
  async saveRecommendationFeedback(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecommendationFeedbackDto,
  ): Promise<void> {
    await this.recommendationUseCase.saveRecommendationFeedback(
      user.id,
      dto.bookId,
      dto.liked,
    );
  }
}
