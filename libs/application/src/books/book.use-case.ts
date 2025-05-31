import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  IBookRepository,
  Book,
  BookProps,
  BookSearchOptions,
  IAuthorRepository,
  IGenreRepository,
  ITagRepository,
  IBookLikeRepository,
  IBookFavoriteRepository,
  BookFavorite,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BookUseCase {
  private readonly logger = new Logger(BookUseCase.name);

  constructor(
    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,

    @Inject('IAuthorRepository')
    private readonly authorRepo: IAuthorRepository,

    @Inject('IGenreRepository')
    private readonly genreRepo: IGenreRepository,

    @Inject('ITagRepository')
    private readonly tagRepo: ITagRepository,

    @Inject('IBookLikeRepository')
    private readonly bookLikeRepo: IBookLikeRepository,

    @Inject('IBookFavoriteRepository')
    private readonly bookFavoriteRepo: IBookFavoriteRepository,
  ) {}

  async createBook(
    data: Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>,
    authorIds?: string[],
    genreIds?: string[],
    tagIds?: string[],
  ): Promise<Book> {
    // Validate relationships if provided
    if (authorIds && authorIds.length > 0) {
      await this.validateAuthors(authorIds);
    }

    if (genreIds && genreIds.length > 0) {
      await this.validateGenres(genreIds);
    }

    if (tagIds && tagIds.length > 0) {
      await this.validateTags(tagIds);
    }

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

    // Create the book first
    await this.bookRepo.create(book);

    // Then create all relationships
    try {
      const relationPromises = [];

      if (authorIds && authorIds.length > 0) {
        relationPromises.push(this.bookRepo.addAuthors(book.id, authorIds));
      }

      if (genreIds && genreIds.length > 0) {
        relationPromises.push(this.bookRepo.addGenres(book.id, genreIds));
      }

      if (tagIds && tagIds.length > 0) {
        relationPromises.push(this.bookRepo.addTags(book.id, tagIds));
      }

      if (relationPromises.length > 0) {
        await Promise.all(relationPromises);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error setting relationships for book ${book.id}: ${errorMessage}`,
      );
      // Consider cleanup if critical relationships fail
    }

    return book;
  }

  async updateBook(
    bookId: string,
    partial: Partial<BookProps>,
    authorIds?: string[],
    genreIds?: string[],
    tagIds?: string[],
  ): Promise<Book | null> {
    const existing = await this.bookRepo.findById(bookId);
    if (!existing) return null;

    // Validate relationships if provided
    if (authorIds) {
      await this.validateAuthors(authorIds);
    }

    if (genreIds) {
      await this.validateGenres(genreIds);
    }

    if (tagIds) {
      await this.validateTags(tagIds);
    }

    const now = new Date();
    const updatedProps = {
      ...existing.toPrimitives(),
      ...partial,
      updatedAt: now,
    };
    const updatedBook = new Book(updatedProps);
    await this.bookRepo.update(updatedBook);

    // Update relationships if provided
    try {
      const relationPromises = [];

      if (authorIds !== undefined) {
        relationPromises.push(this.bookRepo.replaceAuthors(bookId, authorIds));
      }

      if (genreIds !== undefined) {
        relationPromises.push(this.bookRepo.replaceGenres(bookId, genreIds));
      }

      if (tagIds !== undefined) {
        relationPromises.push(this.bookRepo.replaceTags(bookId, tagIds));
      }

      if (relationPromises.length > 0) {
        await Promise.all(relationPromises);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error updating relationships for book ${bookId}: ${errorMessage}`,
      );
    }

    return updatedBook;
  }

  async deleteBook(bookId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.delete(bookId);
  }

  async getBookWithRelationships(bookId: string): Promise<{
    book: Book;
    authors: any[];
    genres: any[];
    tags: any[];
  } | null> {
    const result = await this.bookRepo.findByIdWithRelationships(bookId);
    if (!result) return null;

    const { book, authorIds, genreIds, tagIds } = result;

    // Get detailed information for each relationship
    const [authors, genres, tags] = await Promise.all([
      this.getAuthorDetails(authorIds),
      this.getGenreDetails(genreIds),
      this.getTagDetails(tagIds),
    ]);

    return {
      book,
      authors,
      genres,
      tags,
    };
  }

  async searchBooksWithPagination(
    options: BookSearchOptions,
  ): Promise<PaginatedResponse<Book>> {
    const [books, total] = await Promise.all([
      this.bookRepo.search(options),
      this.bookRepo.count(options),
    ]);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      items: books,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getMostLikedBooks(limit: number): Promise<Book[]> {
    return this.bookRepo.findMostLiked(limit);
  }

  async getRelatedBooks(bookId: string, limit = 5): Promise<Book[]> {
    const book = await this.getBookWithRelationships(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    // Get IDs for related entities
    const authorIds = book.authors.map((a) => a.id);
    const genreIds = book.genres.map((g) => g.id);
    const tagIds = book.tags.map((t) => t.id);

    return this.bookRepo.findRelatedBooks(
      bookId,
      authorIds,
      genreIds,
      tagIds,
      limit,
    );
  }

  // Author relationship methods
  async addAuthorsToBook(bookId: string, authorIds: string[]): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.validateAuthors(authorIds);
    await this.bookRepo.addAuthors(bookId, authorIds);
  }

  async removeAuthorsFromBook(
    bookId: string,
    authorIds: string[],
  ): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.removeAuthors(bookId, authorIds);
  }

  async getBookAuthors(bookId: string): Promise<any[]> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    const authorIds = await this.bookRepo.getBookAuthors(bookId);
    return this.getAuthorDetails(authorIds);
  }

  // Genre relationship methods
  async addGenresToBook(bookId: string, genreIds: string[]): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.validateGenres(genreIds);
    await this.bookRepo.addGenres(bookId, genreIds);
  }

  async removeGenresFromBook(
    bookId: string,
    genreIds: string[],
  ): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.removeGenres(bookId, genreIds);
  }

  async getBookGenres(bookId: string): Promise<any[]> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    const genreIds = await this.bookRepo.getBookGenres(bookId);
    return this.getGenreDetails(genreIds);
  }

  // Tag relationship methods
  async addTagsToBook(bookId: string, tagIds: string[]): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.validateTags(tagIds);
    await this.bookRepo.addTags(bookId, tagIds);
  }

  async removeTagsFromBook(bookId: string, tagIds: string[]): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.removeTags(bookId, tagIds);
  }

  async getBookTags(bookId: string): Promise<any[]> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    const tagIds = await this.bookRepo.getBookTags(bookId);
    return this.getTagDetails(tagIds);
  }

  async likeBook(bookId: string, userId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.addLike(bookId, userId);

    // Update total likes count
    book.addLike();
    await this.bookRepo.update(book);
  }

  async unlikeBook(bookId: string, userId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    await this.bookRepo.removeLike(bookId, userId);

    // Update total likes count
    book.removeLike();
    await this.bookRepo.update(book);
  }

  async hasUserLikedBook(bookId: string, userId: string): Promise<boolean> {
    return this.bookRepo.hasLike(bookId, userId);
  }

  async getBatchLikedStatus(
    bookIds: string[],
    userId?: string,
  ): Promise<Map<string, boolean>> {
    if (!userId || bookIds.length === 0) {
      return new Map();
    }

    // Get all likes for these books by this user in a single query
    const likes = await this.bookRepo.findManyLikes(bookIds, userId);

    // Create a map of bookId -> liked status
    const likedMap = new Map<string, boolean>();
    likes.forEach((like) => likedMap.set(like.bookId, true));

    return likedMap;
  }

  async getLikedBooks(userId: string): Promise<Book[]> {
    if (!userId) {
      return [];
    }

    const likes = await this.bookLikeRepo.findByUser(userId);
    const bookIds = likes.map((like) => like.bookId);

    if (bookIds.length === 0) {
      return [];
    }

    // Fetch the actual book objects
    const books: Book[] = [];
    for (const bookId of bookIds) {
      const book = await this.bookRepo.findById(bookId);
      if (book) {
        books.push(book);
      }
    }

    return books;
  }

  async addToFavorites(bookId: string, userId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    // Check if already in favorites
    const existing = await this.bookFavoriteRepo.find(userId, bookId);
    if (existing) {
      return; // Already in favorites, no need to add again
    }

    const favorite = new BookFavorite({
      userId,
      bookId,
      addedAt: new Date(),
    });

    await this.bookFavoriteRepo.add(favorite);
  }

  async removeFromFavorites(bookId: string, userId: string): Promise<void> {
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    // Check if in favorites
    const existing = await this.bookFavoriteRepo.find(userId, bookId);
    if (!existing) {
      return; // Not in favorites, nothing to remove
    }

    await this.bookFavoriteRepo.remove(userId, bookId);
  }

  async isInFavorites(bookId: string, userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const favorite = await this.bookFavoriteRepo.find(userId, bookId);
    return !!favorite;
  }

  async getFavoriteBooks(userId: string): Promise<Book[]> {
    if (!userId) {
      return [];
    }

    const favorites = await this.bookFavoriteRepo.findByUser(userId);
    const bookIds = favorites.map((favorite) => favorite.bookId);

    if (bookIds.length === 0) {
      return [];
    }

    // Fetch the actual book objects
    const books: Book[] = [];
    for (const bookId of bookIds) {
      const book = await this.bookRepo.findById(bookId);
      if (book) {
        books.push(book);
      }
    }

    return books;
  }

  // Validation and helper methods
  private async validateAuthors(authorIds: string[]): Promise<void> {
    for (const authorId of authorIds) {
      const author = await this.authorRepo.findById(authorId);
      if (!author) {
        throw new NotFoundException(`Author with id=${authorId} not found`);
      }
    }
  }

  private async validateGenres(genreIds: string[]): Promise<void> {
    for (const genreId of genreIds) {
      const genre = await this.genreRepo.findById(genreId);
      if (!genre) {
        throw new NotFoundException(`Genre with id=${genreId} not found`);
      }
    }
  }

  private async validateTags(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      const tag = await this.tagRepo.findById(tagId);
      if (!tag) {
        throw new NotFoundException(`Tag with id=${tagId} not found`);
      }
    }
  }

  private async getAuthorDetails(authorIds: string[]): Promise<any[]> {
    const authors = await Promise.all(
      authorIds.map(async (id) => {
        const author = await this.authorRepo.findById(id);
        if (!author) return null;

        const props = author.toPrimitives();
        return {
          id: props.id,
          name: props.name,
        };
      }),
    );

    return authors.filter((a) => a !== null);
  }

  private async getGenreDetails(genreIds: string[]): Promise<any[]> {
    const genres = await Promise.all(
      genreIds.map(async (id) => {
        const genre = await this.genreRepo.findById(id);
        if (!genre) return null;

        const props = genre.toPrimitives();
        return {
          id: props.id,
          name: props.name,
        };
      }),
    );

    return genres.filter((g) => g !== null);
  }

  private async getTagDetails(tagIds: string[]): Promise<any[]> {
    const tags = await Promise.all(
      tagIds.map(async (id) => {
        const tag = await this.tagRepo.findById(id);
        if (!tag) return null;

        const props = tag.toPrimitives();
        return {
          id: props.id,
          label: props.label,
        };
      }),
    );

    return tags.filter((t) => t !== null);
  }
}
