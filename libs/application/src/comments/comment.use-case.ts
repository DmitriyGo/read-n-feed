import { Inject, Injectable } from '@nestjs/common';
import {
  IBookCommentRepository,
  BookComment,
  BookCommentProps,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentService {
  constructor(
    @Inject('IBookCommentRepository')
    private readonly commentRepo: IBookCommentRepository,
  ) {}

  async createComment(
    data: Omit<BookCommentProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BookComment> {
    const now = new Date();
    const comment = new BookComment({
      id: uuidv4(),
      bookId: data.bookId,
      userId: data.userId,
      content: data.content,
      parentCommentId: data.parentCommentId ?? null,
      createdAt: now,
      updatedAt: now,
    });
    await this.commentRepo.create(comment);
    return comment;
  }

  async updateComment(
    commentId: string,
    newContent: string,
  ): Promise<BookComment | null> {
    const existing = await this.commentRepo.findById(commentId);
    if (!existing) return null;

    existing.updateContent(newContent);
    await this.commentRepo.update(existing);
    return existing;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.commentRepo.delete(commentId);
  }

  async getCommentById(commentId: string): Promise<BookComment | null> {
    return this.commentRepo.findById(commentId);
  }

  async getCommentsForBook(bookId: string): Promise<BookComment[]> {
    return this.commentRepo.findByBookId(bookId);
  }
}
