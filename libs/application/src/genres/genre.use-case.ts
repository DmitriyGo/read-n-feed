import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Genre, GenreProps, IGenreRepository } from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

import { CreateGenreDto, UpdateGenreDto } from './genre.dto';

@Injectable()
export class GenreUseCase {
  constructor(
    @Inject('IGenreRepository')
    private readonly genreRepo: IGenreRepository,
  ) {}

  async createGenre(dto: CreateGenreDto): Promise<Genre> {
    // Check if genre with same name already exists
    const existing = await this.genreRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Genre with name "${dto.name}" already exists`,
      );
    }

    const genre = new Genre({
      id: uuidv4(),
      name: dto.name,
      description: dto.description ?? null,
    });

    await this.genreRepo.create(genre);
    return genre;
  }

  async updateGenre(genreId: string, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.genreRepo.findById(genreId);
    if (!genre) {
      throw new NotFoundException(`Genre with id=${genreId} not found`);
    }

    // If name is being updated, check for uniqueness
    if (dto.name && dto.name !== genre.name) {
      const existing = await this.genreRepo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(
          `Genre with name "${dto.name}" already exists`,
        );
      }
    }

    const updatedProps: GenreProps = {
      ...genre.toPrimitives(),
      name: dto.name ?? genre.name,
      description:
        dto.description !== undefined
          ? dto.description
          : genre.toPrimitives().description,
    };

    const updatedGenre = new Genre(updatedProps);
    await this.genreRepo.update(updatedGenre);
    return updatedGenre;
  }

  async getGenre(genreId: string): Promise<Genre> {
    const genre = await this.genreRepo.findById(genreId);
    if (!genre) {
      throw new NotFoundException(`Genre with id=${genreId} not found`);
    }
    return genre;
  }

  async getAllGenres(): Promise<Genre[]> {
    return this.genreRepo.listAll();
  }

  async deleteGenre(genreId: string): Promise<void> {
    const genre = await this.genreRepo.findById(genreId);
    if (!genre) {
      throw new NotFoundException(`Genre with id=${genreId} not found`);
    }

    await this.genreRepo.delete(genreId);
  }

  async findGenreByName(name: string): Promise<Genre | null> {
    return this.genreRepo.findByName(name);
  }
}
