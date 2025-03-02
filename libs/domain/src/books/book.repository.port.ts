import { Book } from './book.entity';

export interface BookSearchOptions {
  title?: string; // partial match
  authorName?: string; // partial match
  authorId?: string; // exact match
  genreName?: string; // exact match
  genreId?: string; // exact match
  tagName?: string; // exact match
  tagId?: string; // exact match
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'publicationDate';
  sortOrder?: 'asc' | 'desc';
}

export interface BookRelationships {
  book: Book;
  authorIds: string[];
  genreIds: string[];
  tagIds: string[];
}

export interface IBookRepository {
  // Basic CRUD operations
  create(book: Book): Promise<void>;
  update(book: Book): Promise<void>;
  delete(bookId: string): Promise<void>;
  findById(bookId: string): Promise<Book | null>;
  findByIdWithRelationships(bookId: string): Promise<BookRelationships | null>;

  // Search operations
  search(options: BookSearchOptions): Promise<Book[]>;
  count(options: BookSearchOptions): Promise<number>; // New method for pagination
  findMostLiked(limit: number): Promise<Book[]>;
  findRelatedBooks(
    bookId: string,
    authorIds: string[],
    genreIds: string[],
    tagIds: string[],
    limit: number,
  ): Promise<Book[]>; // New method for recommendations

  // Author relationship methods
  addAuthors(bookId: string, authorIds: string[]): Promise<void>;
  removeAuthors(bookId: string, authorIds: string[]): Promise<void>;
  replaceAuthors(bookId: string, authorIds: string[]): Promise<void>;
  getBookAuthors(bookId: string): Promise<string[]>; // Returns author IDs

  // Genre relationship methods
  addGenres(bookId: string, genreIds: string[]): Promise<void>;
  removeGenres(bookId: string, genreIds: string[]): Promise<void>;
  replaceGenres(bookId: string, genreIds: string[]): Promise<void>;
  getBookGenres(bookId: string): Promise<string[]>; // Returns genre IDs

  // Tag relationship methods
  addTags(bookId: string, tagIds: string[]): Promise<void>;
  removeTags(bookId: string, tagIds: string[]): Promise<void>;
  replaceTags(bookId: string, tagIds: string[]): Promise<void>;
  getBookTags(bookId: string): Promise<string[]>; // Returns tag IDs

  // Like functionality
  addLike(bookId: string, userId: string): Promise<void>;
  removeLike(bookId: string, userId: string): Promise<void>;
  hasLike(bookId: string, userId: string): Promise<boolean>;
  countLikes(bookId: string): Promise<number>;
}
