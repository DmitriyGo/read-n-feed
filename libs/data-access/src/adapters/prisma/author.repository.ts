import { Injectable } from '@nestjs/common';
import { Author as AuthorFromDb } from '@prisma/client';
import { IAuthorRepository, Author } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaAuthorRepository implements IAuthorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(author: Author): Promise<void> {
    const props = author.toPrimitives();
    await this.prisma.author.create({ data: { ...props } });
  }

  async update(author: Author): Promise<void> {
    const props = author.toPrimitives();
    await this.prisma.author.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async findById(authorId: string): Promise<Author | null> {
    const record = await this.prisma.author.findUnique({
      where: { id: authorId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByName(name: string): Promise<Author[]> {
    const records = await this.prisma.author.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: AuthorFromDb): Author {
    return new Author({ ...record });
  }
}
