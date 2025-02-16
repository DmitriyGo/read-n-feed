import { Injectable } from '@nestjs/common';
import { Book as BookFromDb } from '@prisma/client';
import { IBookRepository, Book, BookSearchOptions } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(book: Book): Promise<void> {
    const props = book.toPrimitives();
    await this.prisma.book.create({ data: { ...props } });
  }

  async update(book: Book): Promise<void> {
    const props = book.toPrimitives();
    await this.prisma.book.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async delete(bookId: string): Promise<void> {
    await this.prisma.book.delete({ where: { id: bookId } });
  }

  async findById(bookId: string): Promise<Book | null> {
    const record = await this.prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async search(options: BookSearchOptions): Promise<Book[]> {
    const {
      title,
      authorName,
      genreName,
      tagName,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (authorName) {
      where.authors = {
        some: {
          author: {
            name: { contains: authorName, mode: 'insensitive' },
          },
        },
      };
    }
    if (genreName) {
      where.genres = {
        some: {
          genre: {
            name: { equals: genreName, mode: 'insensitive' },
          },
        },
      };
    }
    if (tagName) {
      where.tags = {
        some: {
          tag: {
            label: { equals: tagName, mode: 'insensitive' },
          },
        },
      };
    }

    const skip = (page - 1) * limit;

    const records = await this.prisma.book.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return records.map((r) => this.toDomain(r));
  }

  async findMostLiked(limit: number): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      orderBy: { totalLikes: 'desc' },
      take: limit,
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: BookFromDb): Book {
    return new Book({ ...record });
  }
}
