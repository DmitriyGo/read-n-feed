import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  ParseUUIDPipe,
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
  AuthorResponseDto,
  CreateAuthorDto,
  UpdateAuthorDto,
  toAuthorResponseDto,
  AuthorUseCase,
} from '@read-n-feed/application';

import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('authors')
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorUseCase: AuthorUseCase) {}

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiBody({ type: CreateAuthorDto })
  @ApiCreatedResponse({
    description: 'Author successfully created',
    type: AuthorResponseDto,
  })
  async createAuthor(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const author = await this.authorUseCase.createAuthor(dto);
    return toAuthorResponseDto(author);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get author by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the author',
    type: AuthorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Author not found' })
  async getAuthor(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuthorResponseDto> {
    const author = await this.authorUseCase.getAuthor(id);
    if (!author) throw new NotFoundException(`Author with id=${id} not found`);
    return toAuthorResponseDto(author);
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update author by ID' })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated author',
    type: AuthorResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Author not found' })
  async updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuthorDto,
  ): Promise<AuthorResponseDto> {
    const updated = await this.authorUseCase.updateAuthor(id, dto);
    if (!updated) throw new NotFoundException(`Author with id=${id} not found`);
    return toAuthorResponseDto(updated);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete author by ID' })
  @ApiResponse({ status: 204, description: 'Author deleted successfully' })
  @ApiNotFoundResponse({ description: 'Author not found' })
  async deleteAuthor(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.authorUseCase.deleteAuthor(id);
  }

  @Get()
  @ApiOperation({ summary: 'Search for authors' })
  @ApiQuery({ name: 'name', required: false })
  @ApiResponse({
    status: 200,
    description: 'Array of authors',
    type: AuthorResponseDto,
    isArray: true,
  })
  async searchAuthors(
    @Query('name') name?: string,
  ): Promise<AuthorResponseDto[]> {
    const authors = await this.authorUseCase.searchAuthors(name);
    return authors.map((author) => toAuthorResponseDto(author));
  }
}
