import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateBookDto,
  UpdateBookDto,
  SearchBooksDto,
  BookResponseDto,
  BookUseCase,
} from '@read-n-feed/application';
import { Book } from '@read-n-feed/domain';

import { Public } from '../auth/guards/public.decorator';

@ApiBearerAuth()
@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookUseCase: BookUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Book' })
  @ApiBody({ type: CreateBookDto })
  @ApiCreatedResponse({
    description: 'Book successfully created',
    type: BookResponseDto,
  })
  async createBook(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.bookUseCase.createBook(dto);
    return this.toResponseDto(book);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Book by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book',
    type: BookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getBook(@Param('id') id: string): Promise<BookResponseDto> {
    const book = await this.bookUseCase.getBook(id);
    if (!book) throw new NotFoundException(`Book with id=${id} not found`);
    return this.toResponseDto(book);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Book by ID' })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated book',
    type: BookResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    const updated = await this.bookUseCase.updateBook(id, dto);
    if (!updated) throw new NotFoundException(`Book with id=${id} not found`);
    return this.toResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Book by ID' })
  @ApiResponse({ status: 204, description: 'Book deleted successfully' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async deleteBook(@Param('id') id: string): Promise<void> {
    const existing = await this.bookUseCase.getBook(id);
    if (!existing) throw new NotFoundException(`Book with id=${id} not found`);
    await this.bookUseCase.deleteBook(id);
  }

  @Get()
  @ApiOperation({ summary: 'Search for Books' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'authorName', required: false })
  @ApiQuery({ name: 'genreName', required: false })
  @ApiQuery({ name: 'tagName', required: false })
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
    description: 'Array of books',
    type: BookResponseDto,
    isArray: true,
  })
  @Public()
  async searchBooks(
    @Query() query: SearchBooksDto,
  ): Promise<BookResponseDto[]> {
    const results = await this.bookUseCase.searchBooks(query);
    return results.map((b) => this.toResponseDto(b));
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
    return results.map((b) => this.toResponseDto(b));
  }

  private toResponseDto(book: Book): BookResponseDto {
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
