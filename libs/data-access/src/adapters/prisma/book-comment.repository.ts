import { Injectable } from '@nestjs/common';
import { BookComment as CommentFromDb } from '@prisma/client';
import { IBookCommentRepository, BookComment } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookCommentRepository implements IBookCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: BookComment): Promise<void> {
    const props = comment.toPrimitives();
    await this.prisma.bookComment.create({ data: { ...props } });
  }

  async update(comment: BookComment): Promise<void> {
    const props = comment.toPrimitives();
    await this.prisma.bookComment.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async delete(commentId: string): Promise<void> {
    await this.prisma.bookComment.delete({ where: { id: commentId } });
  }

  async findById(commentId: string): Promise<BookComment | null> {
    const record = await this.prisma.bookComment.findUnique({
      where: { id: commentId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByBookId(bookId: string): Promise<BookComment[]> {
    const records = await this.prisma.bookComment.findMany({
      where: { bookId },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: CommentFromDb): BookComment {
    return new BookComment({ ...record });
  }
}
