import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  GenreResponseDto,
  CreateGenreDto,
  UpdateGenreDto,
  toGenreResponseDto,
  GenreUseCase,
} from '@read-n-feed/application';

import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreUseCase: GenreUseCase) {}

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new genre' })
  @ApiBody({ type: CreateGenreDto })
  @ApiCreatedResponse({
    description: 'Genre successfully created',
    type: GenreResponseDto,
  })
  async createGenre(@Body() dto: CreateGenreDto): Promise<GenreResponseDto> {
    const genre = await this.genreUseCase.createGenre(dto);
    return toGenreResponseDto(genre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get genre by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the genre',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async getGenre(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GenreResponseDto> {
    const genre = await this.genreUseCase.getGenre(id);
    return toGenreResponseDto(genre);
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update genre by ID' })
  @ApiBody({ type: UpdateGenreDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated genre',
    type: GenreResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async updateGenre(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGenreDto,
  ): Promise<GenreResponseDto> {
    const updated = await this.genreUseCase.updateGenre(id, dto);
    return toGenreResponseDto(updated);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete genre by ID' })
  @ApiResponse({ status: 204, description: 'Genre deleted successfully' })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async deleteGenre(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.genreUseCase.deleteGenre(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all genres' })
  @ApiResponse({
    status: 200,
    description: 'Returns all genres',
    type: [GenreResponseDto],
  })
  async getAllGenres(): Promise<GenreResponseDto[]> {
    const genres = await this.genreUseCase.getAllGenres();
    return genres.map((genre) => toGenreResponseDto(genre));
  }
}
