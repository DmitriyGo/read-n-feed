import { Injectable } from '@nestjs/common';
import { BookLike as LikeFromDb } from '@prisma/client';
import { IBookLikeRepository, BookLike } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookLikeRepository implements IBookLikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(like: BookLike): Promise<void> {
    const props = like.toPrimitives();
    await this.prisma.bookLike.create({ data: { ...props } });
  }

  async remove(userId: string, bookId: string): Promise<void> {
    await this.prisma.bookLike.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }

  async find(userId: string, bookId: string): Promise<BookLike | null> {
    const record = await this.prisma.bookLike.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async countByBook(bookId: string): Promise<number> {
    return this.prisma.bookLike.count({
      where: { bookId },
    });
  }

  private toDomain(record: LikeFromDb): BookLike {
    return new BookLike({ ...record });
  }
}
