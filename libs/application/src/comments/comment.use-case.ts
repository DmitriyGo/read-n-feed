import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IBookCommentRepository,
  BookComment,
  BookCommentProps,
  IUserRepository,
  IBookRepository,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentUseCase {
  constructor(
    @Inject('IBookCommentRepository')
    private readonly commentRepo: IBookCommentRepository,

    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,

    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async createComment(
    data: Omit<BookCommentProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BookComment> {
    const book = await this.bookRepo.findById(data.bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${data.bookId} not found`);
    }

    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundException(`User with id=${data.userId} not found`);
    }

    // if (user.isBlocked) { ... throw some error ... }

    let parent = null;
    if (data.parentCommentId) {
      parent = await this.commentRepo.findById(data.parentCommentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent comment with id=${data.parentCommentId} not found`,
        );
      }
      if (parent.bookId !== data.bookId) {
        throw new ForbiddenException(
          `Parent comment does not belong to the same book`,
        );
      }
    }

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
