import { Injectable } from '@nestjs/common';
import { Genre as GenreFromDb } from '@prisma/client';
import { IGenreRepository, Genre } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaGenreRepository implements IGenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(genre: Genre): Promise<void> {
    const props = genre.toPrimitives();
    await this.prisma.genre.create({ data: { ...props } });
  }

  async update(genre: Genre): Promise<void> {
    const props = genre.toPrimitives();
    await this.prisma.genre.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async delete(id: string): Promise<void> {
    // First, delete all book-genre associations
    await this.prisma.bookGenre.deleteMany({
      where: { genreId: id },
    });

    // Then delete the genre
    await this.prisma.genre.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByName(name: string): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({
      where: { name },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async listAll(): Promise<Genre[]> {
    const records = await this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: GenreFromDb): Genre {
    return new Genre({
      id: record.id,
      name: record.name,
    });
  }
}
