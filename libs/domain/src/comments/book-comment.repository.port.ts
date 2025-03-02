import { BookComment } from './book-comment.entity';

export interface IBookCommentRepository {
  create(comment: BookComment): Promise<void>;
  update(comment: BookComment): Promise<void>;
  delete(commentId: string): Promise<void>;
  findById(commentId: string): Promise<BookComment | null>;
  findByBookId(bookId: string): Promise<BookComment[]>;
}
