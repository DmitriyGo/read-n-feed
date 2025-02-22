import { Book } from './book.entity';

export interface BookSearchOptions {
  title?: string; // partial match
  authorName?: string; // partial match
  genreName?: string;
  tagName?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'publicationDate';
  sortOrder?: 'asc' | 'desc';
}

export interface IBookRepository {
  create(book: Book): Promise<void>;
  update(book: Book): Promise<void>;
  delete(bookId: string): Promise<void>;
  findById(bookId: string): Promise<Book | null>;
  search(options: BookSearchOptions): Promise<Book[]>;
  findMostLiked(limit: number): Promise<Book[]>;
}
