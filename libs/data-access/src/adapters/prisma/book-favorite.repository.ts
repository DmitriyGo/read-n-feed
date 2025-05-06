import { Injectable } from '@nestjs/common';
import { BookFavorite as FavoriteFromDb } from '@prisma/client';
import { IBookFavoriteRepository, BookFavorite } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookFavoriteRepository implements IBookFavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(favorite: BookFavorite): Promise<void> {
    const props = favorite.toPrimitives();
    await this.prisma.bookFavorite.create({ data: { ...props } });
  }

  async remove(userId: string, bookId: string): Promise<void> {
    await this.prisma.bookFavorite.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }

  async find(userId: string, bookId: string): Promise<BookFavorite | null> {
    const record = await this.prisma.bookFavorite.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByUser(userId: string): Promise<BookFavorite[]> {
    const records = await this.prisma.bookFavorite.findMany({
      where: { userId },
      include: { book: true },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: FavoriteFromDb): BookFavorite {
    return new BookFavorite({ ...record });
  }
}
