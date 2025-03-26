import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BookResponseDto,
  BookUseCase,
  CreateBookDto,
  PaginatedBooksResponseDto,
  SearchBooksDto,
  UpdateBookDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { Public } from '../auth/guards/public.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('books')
@Controller('books')
export class BookController {
  private readonly logger = new Logger(BookController.name);

  constructor(private readonly bookUseCase: BookUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Search for Books with pagination' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'authorName', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'genreName', required: false })
  @ApiQuery({ name: 'genreId', required: false })
  @ApiQuery({ name: 'tagName', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['title', 'createdAt', 'publicationDate'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Paginated books with metadata',
    type: PaginatedBooksResponseDto,
  })
  @Public()
  async searchBooks(
    @Query() query: SearchBooksDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedBooksResponseDto> {
    this.logger.debug(
      `Searching books with criteria: ${JSON.stringify(query)}`,
    );

    const result = await this.bookUseCase.searchBooksWithPagination(query);
    const bookIds = result.items.map((book) => book.id);

    const likedStatusMap = await this.bookUseCase.getBatchLikedStatus(
      bookIds,
      user?.id,
    );

    // Get relationship information for each book
    const enhancedItems = await Promise.all(
      result.items.map(async (book) => {
        try {
          const relationships = await this.bookUseCase.getBookWithRelationships(
            book.id,
          );

          return {
            ...this.toResponseDto(book),
            liked: likedStatusMap.has(book.id),
            authors: relationships?.authors || [],
            genres: relationships?.genres || [],
            tags: relationships?.tags || [],
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error getting relationships for book ${book.id}: ${errorMessage}`,
          );

          return {
            ...this.toResponseDto(book),
            authors: [],
            genres: [],
            tags: [],
          };
        }
      }),
    );

    return {
      items: enhancedItems,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Book by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book with relationship information',
    type: BookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  @Public()
  async getBook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookResponseDto> {
    const result = await this.bookUseCase.getBookWithRelationships(id);
    if (!result) throw new NotFoundException(`Book with id=${id} not found`);

    let liked = false;
    if (user?.id) {
      const likedMap = await this.bookUseCase.getBatchLikedStatus(
        [id],
        user.id,
      );
      liked = likedMap.has(id);
    }

    return {
      ...this.toResponseDto(result.book),
      liked,
      authors: result.authors,
      genres: result.genres,
      tags: result.tags,
    };
  }

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new Book' })
  @ApiBody({ type: CreateBookDto })
  @ApiCreatedResponse({
    description: 'Book successfully created',
    type: BookResponseDto,
  })
  async createBook(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    const { authorIds, genreIds, tagIds, ...bookData } = dto;
    const book = await this.bookUseCase.createBook(
      bookData,
      authorIds,
      genreIds,
      tagIds,
    );
    return this.toResponseDto(book);
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update Book by ID' })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated book',
    type: BookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    const { authorIds, genreIds, tagIds, ...bookData } = dto;
    const updated = await this.bookUseCase.updateBook(
      id,
      bookData,
      authorIds,
      genreIds,
      tagIds,
    );

    if (!updated) throw new NotFoundException(`Book with id=${id} not found`);

    // Get updated book with relationship information
    const result = await this.bookUseCase.getBookWithRelationships(id);
    if (!result) throw new NotFoundException(`Book with id=${id} not found`);

    return {
      ...this.toResponseDto(result.book),
      authors: result.authors,
      genres: result.genres,
      tags: result.tags,
    };
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Book by ID' })
  @ApiResponse({ status: 204, description: 'Book deleted successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async deleteBook(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bookUseCase.deleteBook(id);
  }

  @Get('most-liked/:limit')
  @ApiOperation({ summary: 'Get the most liked books' })
  @ApiResponse({
    status: 200,
    description: 'Returns top N books by totalLikes',
    type: BookResponseDto,
    isArray: true,
  })
  async getMostLikedBooks(
    @Param('limit', ParseIntPipe) limit: number,
  ): Promise<BookResponseDto[]> {
    const results = await this.bookUseCase.getMostLikedBooks(limit);

    // Get relationship information for each book
    return await Promise.all(
      results.map(async (book) => {
        try {
          const relationships = await this.bookUseCase.getBookWithRelationships(
            book.id,
          );

          return {
            ...this.toResponseDto(book),
            authors: relationships?.authors || [],
            genres: relationships?.genres || [],
            tags: relationships?.tags || [],
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error getting relationships for book ${book.id}: ${errorMessage}`,
          );

          return {
            ...this.toResponseDto(book),
            authors: [],
            genres: [],
            tags: [],
          };
        }
      }),
    );
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get books related to this book' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of related books to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns related books based on authors, genres, and tags',
    type: BookResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getRelatedBooks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<BookResponseDto[]> {
    const relatedBooks = await this.bookUseCase.getRelatedBooks(id, limit || 5);

    // Get relationship information for each book
    return await Promise.all(
      relatedBooks.map(async (book) => {
        try {
          const relationships = await this.bookUseCase.getBookWithRelationships(
            book.id,
          );

          return {
            ...this.toResponseDto(book),
            authors: relationships?.authors || [],
            genres: relationships?.genres || [],
            tags: relationships?.tags || [],
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error getting relationships for book ${book.id}: ${errorMessage}`,
          );

          return {
            ...this.toResponseDto(book),
            authors: [],
            genres: [],
            tags: [],
          };
        }
      }),
    );
  }

  // Author relationship endpoints
  @Post(':id/authors')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add authors to a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of author IDs to add',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Authors added successfully' })
  @ApiNotFoundResponse({ description: 'Book or author not found' })
  async addAuthorsToBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('authorIds') authorIds: string[],
  ): Promise<void> {
    await this.bookUseCase.addAuthorsToBook(id, authorIds);
  }

  @Delete(':id/authors')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove authors from a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of author IDs to remove',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Authors removed successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async removeAuthorsFromBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('authorIds') authorIds: string[],
  ): Promise<void> {
    await this.bookUseCase.removeAuthorsFromBook(id, authorIds);
  }

  @Get(':id/authors')
  @ApiOperation({ summary: 'Get authors of a book' })
  @ApiResponse({
    status: 200,
    description: 'Returns authors associated with the book',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getBookAuthors(@Param('id', ParseUUIDPipe) id: string): Promise<any[]> {
    return this.bookUseCase.getBookAuthors(id);
  }

  // Genre relationship endpoints
  @Post(':id/genres')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add genres to a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        genreIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of genre IDs to add',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Genres added successfully' })
  @ApiNotFoundResponse({ description: 'Book or genre not found' })
  async addGenresToBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('genreIds') genreIds: string[],
  ): Promise<void> {
    await this.bookUseCase.addGenresToBook(id, genreIds);
  }

  @Delete(':id/genres')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove genres from a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        genreIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of genre IDs to remove',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Genres removed successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async removeGenresFromBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('genreIds') genreIds: string[],
  ): Promise<void> {
    await this.bookUseCase.removeGenresFromBook(id, genreIds);
  }

  @Get(':id/genres')
  @ApiOperation({ summary: 'Get genres of a book' })
  @ApiResponse({
    status: 200,
    description: 'Returns genres associated with the book',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getBookGenres(@Param('id', ParseUUIDPipe) id: string): Promise<any[]> {
    return this.bookUseCase.getBookGenres(id);
  }

  // Tag relationship endpoints
  @Post(':id/tags')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add tags to a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of tag IDs to add',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Tags added successfully' })
  @ApiNotFoundResponse({ description: 'Book or tag not found' })
  async addTagsToBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('tagIds') tagIds: string[],
  ): Promise<void> {
    await this.bookUseCase.addTagsToBook(id, tagIds);
  }

  @Delete(':id/tags')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove tags from a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of tag IDs to remove',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Tags removed successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async removeTagsFromBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('tagIds') tagIds: string[],
  ): Promise<void> {
    await this.bookUseCase.removeTagsFromBook(id, tagIds);
  }

  @Get(':id/tags')
  @ApiOperation({ summary: 'Get tags of a book' })
  @ApiResponse({
    status: 200,
    description: 'Returns tags associated with the book',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          label: { type: 'string' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getBookTags(@Param('id', ParseUUIDPipe) id: string): Promise<any[]> {
    return this.bookUseCase.getBookTags(id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Like a book' })
  @ApiResponse({ status: 204, description: 'Book liked successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async likeBook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    // Check if user has already liked this book
    const alreadyLiked = await this.bookUseCase.hasUserLikedBook(id, user.id);
    if (alreadyLiked) {
      return;
    }

    await this.bookUseCase.likeBook(id, user.id);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a book' })
  @ApiResponse({ status: 204, description: 'Book unliked successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async unlikeBook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.bookUseCase.unlikeBook(id, user.id);
  }

  private toResponseDto(book: any): BookResponseDto {
    const props = book.toPrimitives();
    return {
      id: props.id,
      title: props.title,
      description: props.description,
      coverImageUrl: props.coverImageUrl,
      publicationDate: props.publicationDate ?? undefined,
      publisher: props.publisher ?? undefined,
      averageRating: props.averageRating ?? undefined,
      totalLikes: props.totalLikes,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
