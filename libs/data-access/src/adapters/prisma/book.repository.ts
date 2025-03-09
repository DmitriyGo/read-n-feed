import { Injectable, Logger } from '@nestjs/common';
import { Book as BookFromDb } from '@prisma/client';
import {
  IBookRepository,
  Book,
  BookSearchOptions,
  BookRelationships,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookRepository implements IBookRepository {
  private readonly logger = new Logger(PrismaBookRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(book: Book): Promise<void> {
    const props = book.toPrimitives();
    await this.prisma.book.create({ data: { ...props } });
  }

  async update(book: Book): Promise<void> {
    const props = book.toPrimitives();
    await this.prisma.book.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async delete(bookId: string): Promise<void> {
    await this.prisma.book.delete({ where: { id: bookId } });
  }

  async findById(bookId: string): Promise<Book | null> {
    const record = await this.prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByIdWithRelationships(
    bookId: string,
  ): Promise<BookRelationships | null> {
    const record = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authors: {
          select: {
            authorId: true,
          },
        },
        genres: {
          select: {
            genreId: true,
          },
        },
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    });

    if (!record) return null;

    const authorIds = record.authors.map((a) => a.authorId);
    const genreIds = record.genres.map((g) => g.genreId);
    const tagIds = record.tags.map((t) => t.tagId);
    const book = this.toDomain(record);

    return { book, authorIds, genreIds, tagIds };
  }

  async search(options: BookSearchOptions): Promise<Book[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      // Build where conditions
      const where = this.buildSearchWhere(options);
      const skip = (page - 1) * limit;

      // Define valid sort options
      const orderBy = { [sortBy]: sortOrder };

      // Run the query
      const records = await this.prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching books: ${errorMessage}`);
      throw error;
    }
  }

  async count(options: BookSearchOptions): Promise<number> {
    const where = this.buildSearchWhere(options);
    return this.prisma.book.count({ where });
  }

  async findMostLiked(limit: number): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      orderBy: { totalLikes: 'desc' },
      take: limit,
    });
    return records.map((r) => this.toDomain(r));
  }

  async findRelatedBooks(
    bookId: string,
    authorIds: string[],
    genreIds: string[],
    tagIds: string[],
    limit: number,
  ): Promise<Book[]> {
    // Build a query that finds books that share authors, genres, or tags
    const where: any = {
      // Exclude the current book
      id: { not: bookId },
      OR: [],
    };

    // Add conditions for each relationship type if IDs are provided
    if (authorIds.length > 0) {
      where.OR.push({
        authors: {
          some: {
            authorId: { in: authorIds },
          },
        },
      });
    }

    if (genreIds.length > 0) {
      where.OR.push({
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      });
    }

    if (tagIds.length > 0) {
      where.OR.push({
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      });
    }

    // If no relationships found, return empty array
    if (where.OR.length === 0) {
      return [];
    }

    try {
      const records = await this.prisma.book.findMany({
        where,
        orderBy: [{ totalLikes: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding related books: ${errorMessage}`);
      return [];
    }
  }

  // Author relationship methods
  async addAuthors(bookId: string, authorIds: string[]): Promise<void> {
    const data = authorIds.map((authorId) => ({
      bookId,
      authorId,
    }));

    await this.prisma.bookAuthor.createMany({
      data,
      skipDuplicates: true, // Skip if relation already exists
    });
  }

  async removeAuthors(bookId: string, authorIds: string[]): Promise<void> {
    await this.prisma.bookAuthor.deleteMany({
      where: {
        bookId,
        authorId: {
          in: authorIds,
        },
      },
    });
  }

  async replaceAuthors(bookId: string, authorIds: string[]): Promise<void> {
    // Transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Remove all existing author associations
      await tx.bookAuthor.deleteMany({
        where: { bookId },
      });

      // Add new author associations
      if (authorIds.length > 0) {
        await tx.bookAuthor.createMany({
          data: authorIds.map((authorId) => ({
            bookId,
            authorId,
          })),
        });
      }
    });
  }

  async getBookAuthors(bookId: string): Promise<string[]> {
    const relations = await this.prisma.bookAuthor.findMany({
      where: { bookId },
      select: { authorId: true },
    });

    return relations.map((r) => r.authorId);
  }

  // Genre relationship methods
  async addGenres(bookId: string, genreIds: string[]): Promise<void> {
    const data = genreIds.map((genreId) => ({
      bookId,
      genreId,
    }));

    await this.prisma.bookGenre.createMany({
      data,
      skipDuplicates: true, // Skip if relation already exists
    });
  }

  async removeGenres(bookId: string, genreIds: string[]): Promise<void> {
    await this.prisma.bookGenre.deleteMany({
      where: {
        bookId,
        genreId: {
          in: genreIds,
        },
      },
    });
  }

  async replaceGenres(bookId: string, genreIds: string[]): Promise<void> {
    // Transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Remove all existing genre associations
      await tx.bookGenre.deleteMany({
        where: { bookId },
      });

      // Add new genre associations
      if (genreIds.length > 0) {
        await tx.bookGenre.createMany({
          data: genreIds.map((genreId) => ({
            bookId,
            genreId,
          })),
        });
      }
    });
  }

  async getBookGenres(bookId: string): Promise<string[]> {
    const relations = await this.prisma.bookGenre.findMany({
      where: { bookId },
      select: { genreId: true },
    });

    return relations.map((r) => r.genreId);
  }

  // Tag relationship methods
  async addTags(bookId: string, tagIds: string[]): Promise<void> {
    const data = tagIds.map((tagId) => ({
      bookId,
      tagId,
    }));

    await this.prisma.bookTag.createMany({
      data,
      skipDuplicates: true, // Skip if relation already exists
    });
  }

  async removeTags(bookId: string, tagIds: string[]): Promise<void> {
    await this.prisma.bookTag.deleteMany({
      where: {
        bookId,
        tagId: {
          in: tagIds,
        },
      },
    });
  }

  async replaceTags(bookId: string, tagIds: string[]): Promise<void> {
    // Transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Remove all existing tag associations
      await tx.bookTag.deleteMany({
        where: { bookId },
      });

      // Add new tag associations
      if (tagIds.length > 0) {
        await tx.bookTag.createMany({
          data: tagIds.map((tagId) => ({
            bookId,
            tagId,
          })),
        });
      }
    });
  }

  async getBookTags(bookId: string): Promise<string[]> {
    const relations = await this.prisma.bookTag.findMany({
      where: { bookId },
      select: { tagId: true },
    });

    return relations.map((r) => r.tagId);
  }

  // Like functionality
  async addLike(bookId: string, userId: string): Promise<void> {
    try {
      await this.prisma.bookLike.create({
        data: {
          userId,
          bookId,
          likedAt: new Date(),
        },
      });
    } catch (error) {
      // Handle unique constraint violations (already liked)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Unique constraint')) {
        this.logger.debug(`User ${userId} already liked book ${bookId}`);
        return;
      }
      throw error;
    }
  }

  async removeLike(bookId: string, userId: string): Promise<void> {
    await this.prisma.bookLike
      .delete({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
      })
      .catch((error) => {
        // If record not found, it's not a critical error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Record to delete does not exist')) {
          this.logger.debug(
            `No like found for user ${userId} on book ${bookId}`,
          );
          return;
        }
        throw error;
      });
  }

  async hasLike(bookId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    return !!like;
  }

  async findManyLikes(
    bookIds: string[],
    userId: string,
  ): Promise<{ bookId: string }[]> {
    return this.prisma.bookLike.findMany({
      where: {
        bookId: { in: bookIds },
        userId,
      },
      select: {
        bookId: true,
      },
    });
  }

  private toDomain(record: BookFromDb): Book {
    return new Book({ ...record });
  }

  private buildSearchWhere(options: BookSearchOptions): any {
    const { title, authorName, authorId, genreName, genreId, tagName, tagId } =
      options;

    const where: any = {};

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    // Author filter
    if (authorId) {
      where.authors = {
        some: {
          authorId,
        },
      };
    } else if (authorName) {
      where.authors = {
        some: {
          author: {
            name: { contains: authorName, mode: 'insensitive' },
          },
        },
      };
    }

    // Genre filter
    if (genreId) {
      where.genres = {
        some: {
          genreId,
        },
      };
    } else if (genreName) {
      where.genres = {
        some: {
          genre: {
            name: { equals: genreName, mode: 'insensitive' },
          },
        },
      };
    }

    // Tag filter
    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    } else if (tagName) {
      where.tags = {
        some: {
          tag: {
            label: { equals: tagName, mode: 'insensitive' },
          },
        },
      };
    }

    return where;
  }
}
