import { Inject, Injectable } from '@nestjs/common';
import {
  IBookRepository,
  Book,
  BookProps,
  BookSearchOptions,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookUseCase {
  constructor(
    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,
  ) {}

  async createBook(
    data: Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Book> {
    const now = new Date();
    const book = new Book({
      id: uuidv4(),
      title: data.title,
      description: data.description ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      publicationDate: data.publicationDate ?? null,
      publisher: data.publisher ?? null,
      averageRating: data.averageRating ?? null,
      totalLikes: 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.bookRepo.create(book);
    return book;
  }

  async updateBook(
    bookId: string,
    partial: Partial<BookProps>,
  ): Promise<Book | null> {
    const existing = await this.bookRepo.findById(bookId);
    if (!existing) return null;

    const now = new Date();
    const updatedProps = {
      ...existing.toPrimitives(),
      ...partial,
      updatedAt: now,
    };
    const updatedBook = new Book(updatedProps);
    await this.bookRepo.update(updatedBook);
    return updatedBook;
  }

  async deleteBook(bookId: string): Promise<void> {
    await this.bookRepo.delete(bookId);
  }

  async getBook(bookId: string): Promise<Book | null> {
    return this.bookRepo.findById(bookId);
  }

  async searchBooks(options: BookSearchOptions): Promise<Book[]> {
    return this.bookRepo.search(options);
  }

  async getMostLikedBooks(limit: number): Promise<Book[]> {
    return this.bookRepo.findMostLiked(limit);
  }
}
