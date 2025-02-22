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

  async findById(id: string): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByName(name: string): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({ where: { name } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async listAll(): Promise<Genre[]> {
    const records = await this.prisma.genre.findMany();
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: GenreFromDb): Genre {
    return new Genre({ ...record });
  }
}
