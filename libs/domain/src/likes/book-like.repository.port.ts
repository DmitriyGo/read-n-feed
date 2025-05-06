import { BookLike } from './book-like.entity';

export interface IBookLikeRepository {
  add(like: BookLike): Promise<void>;
  remove(userId: string, bookId: string): Promise<void>;
  find(userId: string, bookId: string): Promise<BookLike | null>;
  countByBook(bookId: string): Promise<number>;
  findByUser(userId: string): Promise<BookLike[]>;
}
