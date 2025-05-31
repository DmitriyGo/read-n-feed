import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BookRecommendation,
  IRecommendationRepository,
  RecommendationParams,
  RecommendationSource,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaRecommendationRepository
  implements IRecommendationRepository
{
  private readonly logger = new Logger(PrismaRecommendationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get personalized recommendations for a user based on their preferences and history
   */
  async getPersonalizedRecommendations(
    params: RecommendationParams,
  ): Promise<BookRecommendation[]> {
    const {
      userId,
      limit = 20,
      includeRead = false,
      genreWeighting = 1.0,
      tagWeighting = 0.8,
      authorWeighting = 1.0,
      recentActivityWeighting = 1.2,
      popularityWeighting = 0.7,
      excludeBookIds = [],
    } = params;

    try {
      // Step 1: Get books the user has already interacted with
      const userReadingHistory = await this.prisma.readingProgress.findMany({
        where: { userId },
        select: { bookId: true, progress: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      });

      const readBookIds = userReadingHistory.map((item) => item.bookId);

      // Get books the user has liked
      const userLikes = await this.prisma.bookLike.findMany({
        where: { userId },
        select: { bookId: true, likedAt: true },
        orderBy: { likedAt: 'desc' },
      });

      const likedBookIds = userLikes.map((item) => item.bookId);

      // Build exclusion list
      const finalExcludeBookIds = new Set([
        ...excludeBookIds,
        ...(includeRead ? [] : readBookIds),
      ]);

      // Step 2: Get genre preferences from user's reading history
      const readAndLikedBooks = readBookIds.concat(likedBookIds);
      let userGenres: { genreId: string; count: number }[] = [];

      if (readAndLikedBooks.length > 0) {
        userGenres = await this.prisma.$queryRaw<
          { genreId: string; count: number }[]
        >`
          SELECT g.id as "genreId", COUNT(*) as count
          FROM book_genre bg
          JOIN genre g ON bg.genre_id = g.id
          WHERE bg.book_id IN (${Prisma.join(readAndLikedBooks)})
          GROUP BY g.id
          ORDER BY count DESC
          LIMIT 5
        `;
      }

      // Step 3: Get author preferences from user's reading history
      let userAuthors: { authorId: string; count: number }[] = [];

      if (readAndLikedBooks.length > 0) {
        userAuthors = await this.prisma.$queryRaw<
          { authorId: string; count: number }[]
        >`
          SELECT a.id as "authorId", COUNT(*) as count
          FROM book_author ba
          JOIN author a ON ba.author_id = a.id
          WHERE ba.book_id IN (${Prisma.join(readAndLikedBooks)})
          GROUP BY a.id
          ORDER BY count DESC
          LIMIT 5
        `;
      }

      // Step 4: Get tag preferences from user's reading history
      let userTags: { tagId: string; count: number }[] = [];

      if (readAndLikedBooks.length > 0) {
        userTags = await this.prisma.$queryRaw<
          { tagId: string; count: number }[]
        >`
          SELECT t.id as "tagId", COUNT(*) as count
          FROM book_tag bt
          JOIN tag t ON bt.tag_id = t.id
          WHERE bt.book_id IN (${Prisma.join(readAndLikedBooks)})
          GROUP BY t.id
          ORDER BY count DESC
          LIMIT 5
        `;
      }

      // Step 5: Calculate a score for each book based on various factors
      const bookScores = new Map<
        string,
        { score: number; sources: RecommendationSource[] }
      >();

      // Books with similar genres
      if (userGenres.length > 0) {
        const genreIds = userGenres.map((g) => g.genreId);
        const booksByGenre = await this.prisma.bookGenre.findMany({
          where: {
            genreId: { in: genreIds },
            book: {
              id: { notIn: Array.from(finalExcludeBookIds) },
            },
          },
          include: {
            genre: true,
            book: true,
          },
        });

        // Group by book and calculate genre score
        const bookGenreMap = new Map<string, Set<string>>();

        booksByGenre.forEach((item) => {
          if (!bookGenreMap.has(item.bookId)) {
            bookGenreMap.set(item.bookId, new Set());
          }
          bookGenreMap.get(item.bookId)?.add(item.genreId);
        });

        // Calculate score based on genre overlap
        for (const [bookId, genres] of bookGenreMap.entries()) {
          let genreScore = 0;
          userGenres.forEach((userGenre) => {
            if (genres.has(userGenre.genreId)) {
              // Weight by how important this genre is to user
              genreScore +=
                (Number(userGenre.count) / Number(userGenres.length)) *
                Number(genreWeighting);
            }
          });

          const bookData = bookScores.get(bookId) || { score: 0, sources: [] };
          bookData.score += genreScore;
          bookData.sources.push('GENRE_BASED');
          bookScores.set(bookId, bookData);
        }
      }

      // Books with similar authors
      if (userAuthors.length > 0) {
        const authorIds = userAuthors.map((a) => a.authorId);
        const booksByAuthor = await this.prisma.bookAuthor.findMany({
          where: {
            authorId: { in: authorIds },
            book: {
              id: { notIn: Array.from(finalExcludeBookIds) },
            },
          },
          include: {
            author: true,
            book: true,
          },
        });

        // Group by book and calculate author score
        const bookAuthorMap = new Map<string, Set<string>>();

        booksByAuthor.forEach((item) => {
          if (!bookAuthorMap.has(item.bookId)) {
            bookAuthorMap.set(item.bookId, new Set());
          }
          bookAuthorMap.get(item.bookId)?.add(item.authorId);
        });

        // Calculate score based on author overlap
        for (const [bookId, authors] of bookAuthorMap.entries()) {
          let authorScore = 0;
          userAuthors.forEach((userAuthor) => {
            if (authors.has(userAuthor.authorId)) {
              // Weight by how important this author is to user
              authorScore +=
                (Number(userAuthor.count) / Number(userAuthors.length)) *
                Number(authorWeighting);
            }
          });

          const bookData = bookScores.get(bookId) || { score: 0, sources: [] };
          bookData.score += authorScore;
          bookData.sources.push('AUTHOR_BASED');
          bookScores.set(bookId, bookData);
        }
      }

      // Books with similar tags
      if (userTags.length > 0) {
        const tagIds = userTags.map((t) => t.tagId);
        const booksByTag = await this.prisma.bookTag.findMany({
          where: {
            tagId: { in: tagIds },
            book: {
              id: { notIn: Array.from(finalExcludeBookIds) },
            },
          },
          include: {
            tag: true,
            book: true,
          },
        });

        // Group by book and calculate tag score
        const bookTagMap = new Map<string, Set<string>>();

        booksByTag.forEach((item) => {
          if (!bookTagMap.has(item.bookId)) {
            bookTagMap.set(item.bookId, new Set());
          }
          bookTagMap.get(item.bookId)?.add(item.tagId);
        });

        // Calculate score based on tag overlap
        for (const [bookId, tags] of bookTagMap.entries()) {
          let tagScore = 0;
          userTags.forEach((userTag) => {
            if (tags.has(userTag.tagId)) {
              // Weight by how important this tag is to user
              tagScore +=
                (Number(userTag.count) / Number(userTags.length)) *
                Number(tagWeighting);
            }
          });

          const bookData = bookScores.get(bookId) || { score: 0, sources: [] };
          bookData.score += tagScore;
          bookData.sources.push('TAG_BASED');
          bookScores.set(bookId, bookData);
        }
      }

      // Add popularity factor
      const popularBooks = await this.prisma.book.findMany({
        where: {
          id: { notIn: Array.from(finalExcludeBookIds) },
        },
        orderBy: { totalLikes: 'desc' },
        take: 50, // Consider top 50 popular books
      });

      popularBooks.forEach((book, index) => {
        // Calculate popularity score (higher for more popular books)
        const popularityScore = ((50 - index) / 50) * popularityWeighting;

        const bookData = bookScores.get(book.id) || { score: 0, sources: [] };
        bookData.score += popularityScore;

        if (!bookData.sources.includes('TRENDING')) {
          bookData.sources.push('TRENDING');
        }

        bookScores.set(book.id, bookData);
      });

      // Bonus for new releases
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const newReleases = await this.prisma.book.findMany({
        where: {
          id: { notIn: Array.from(finalExcludeBookIds) },
          createdAt: { gte: twoMonthsAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      newReleases.forEach((book) => {
        const newReleaseScore = 0.5; // Fixed bonus for new books

        const bookData = bookScores.get(book.id) || { score: 0, sources: [] };
        bookData.score += newReleaseScore;

        if (!bookData.sources.includes('NEW_RELEASES')) {
          bookData.sources.push('NEW_RELEASES');
        }

        bookScores.set(book.id, bookData);
      });

      // Step 6: Sort and return top recommendations
      const recommendations = [...bookScores.entries()]
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit)
        .map(([bookId, { score, sources }]) => ({
          bookId,
          score,
          sources,
          createdAt: new Date(),
        }));

      return recommendations;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting personalized recommendations: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get similar books to a specific book
   */
  async getSimilarBooks(
    bookId: string,
    limit = 10,
  ): Promise<BookRecommendation[]> {
    try {
      // Step 1: Get the book's genres, authors, and tags
      const bookGenres = await this.prisma.bookGenre.findMany({
        where: { bookId },
        select: { genreId: true },
      });

      const bookAuthors = await this.prisma.bookAuthor.findMany({
        where: { bookId },
        select: { authorId: true },
      });

      const bookTags = await this.prisma.bookTag.findMany({
        where: { bookId },
        select: { tagId: true },
      });

      const genreIds = bookGenres.map((g) => g.genreId);
      const authorIds = bookAuthors.map((a) => a.authorId);
      const tagIds = bookTags.map((t) => t.tagId);

      // Step 2: Find books with similar characteristics
      const similarBooks = new Map<
        string,
        { score: number; sources: RecommendationSource[] }
      >();

      // By genre
      if (genreIds.length > 0) {
        const booksByGenre = await this.prisma.bookGenre.findMany({
          where: {
            genreId: { in: genreIds },
            bookId: { not: bookId },
          },
          select: { bookId: true, genreId: true },
        });

        // Count genre matches per book
        const bookGenreMatches = new Map<string, number>();
        booksByGenre.forEach((item) => {
          bookGenreMatches.set(
            item.bookId,
            (bookGenreMatches.get(item.bookId) || 0) + 1,
          );
        });

        // Calculate similarity score based on genre overlap
        for (const [similarBookId, matchCount] of bookGenreMatches.entries()) {
          const genreScore = (matchCount / genreIds.length) * 1.2; // Weight genres highly

          const bookData = similarBooks.get(similarBookId) || {
            score: 0,
            sources: [],
          };
          bookData.score += genreScore;
          bookData.sources.push('GENRE_BASED');
          similarBooks.set(similarBookId, bookData);
        }
      }

      // By author
      if (authorIds.length > 0) {
        const booksByAuthor = await this.prisma.bookAuthor.findMany({
          where: {
            authorId: { in: authorIds },
            bookId: { not: bookId },
          },
          select: { bookId: true, authorId: true },
        });

        // Count author matches per book
        const bookAuthorMatches = new Map<string, number>();
        booksByAuthor.forEach((item) => {
          bookAuthorMatches.set(
            item.bookId,
            (bookAuthorMatches.get(item.bookId) || 0) + 1,
          );
        });

        // Calculate similarity score based on author overlap
        for (const [similarBookId, matchCount] of bookAuthorMatches.entries()) {
          const authorScore = (matchCount / authorIds.length) * 1.5; // Weight authors very highly

          const bookData = similarBooks.get(similarBookId) || {
            score: 0,
            sources: [],
          };
          bookData.score += authorScore;
          bookData.sources.push('AUTHOR_BASED');
          similarBooks.set(similarBookId, bookData);
        }
      }

      // By tag
      if (tagIds.length > 0) {
        const booksByTag = await this.prisma.bookTag.findMany({
          where: {
            tagId: { in: tagIds },
            bookId: { not: bookId },
          },
          select: { bookId: true, tagId: true },
        });

        // Count tag matches per book
        const bookTagMatches = new Map<string, number>();
        booksByTag.forEach((item) => {
          bookTagMatches.set(
            item.bookId,
            (bookTagMatches.get(item.bookId) || 0) + 1,
          );
        });

        // Calculate similarity score based on tag overlap
        for (const [similarBookId, matchCount] of bookTagMatches.entries()) {
          const tagScore = (matchCount / tagIds.length) * 1.0;

          const bookData = similarBooks.get(similarBookId) || {
            score: 0,
            sources: [],
          };
          bookData.score += tagScore;
          bookData.sources.push('TAG_BASED');
          similarBooks.set(similarBookId, bookData);
        }
      }

      // Step 3: Sort and return top recommendations
      const recommendations = [...similarBooks.entries()]
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit)
        .map(([similarBookId, { score, sources }]) => ({
          bookId: similarBookId,
          score,
          sources,
          createdAt: new Date(),
        }));

      return recommendations;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting similar books: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get trending books based on recent activity and popularity
   */
  async getTrendingBooks(limit = 10): Promise<BookRecommendation[]> {
    try {
      // Get books with most likes in the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Recent likes weighted by recency (more recent = higher weight)
      const recentLikes = await this.prisma.bookLike.findMany({
        where: {
          likedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { likedAt: 'desc' },
        select: { bookId: true, likedAt: true },
      });

      // Calculate trending score based on recent likes
      const trendingScores = new Map<string, number>();

      // Today gets 1.0 weight, 30 days ago gets 0.5 weight
      const now = new Date();
      const daysPast30 = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      recentLikes.forEach((like) => {
        const recencyFactor =
          0.5 +
          0.5 * (1 - (now.getTime() - like.likedAt.getTime()) / daysPast30);
        trendingScores.set(
          like.bookId,
          (trendingScores.get(like.bookId) || 0) + recencyFactor,
        );
      });

      // Add in overall popularity factor
      const popularBooks = await this.prisma.book.findMany({
        where: {
          totalLikes: { gt: 0 },
        },
        orderBy: { totalLikes: 'desc' },
        take: 50,
      });

      popularBooks.forEach((book, index) => {
        const popularityScore = 0.5 * ((50 - index) / 50); // Scale from 0.5 to 0
        trendingScores.set(
          book.id,
          (trendingScores.get(book.id) || 0) + popularityScore,
        );
      });

      // Add in recent reading activity
      const recentReading = await this.prisma.readingProgress.findMany({
        where: {
          updatedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { updatedAt: 'desc' },
        select: { bookId: true, updatedAt: true },
      });

      recentReading.forEach((progress) => {
        const recencyFactor =
          0.3 *
          (1 - (now.getTime() - progress.updatedAt.getTime()) / daysPast30);
        trendingScores.set(
          progress.bookId,
          (trendingScores.get(progress.bookId) || 0) + recencyFactor,
        );
      });

      // Sort by trending score and return top results
      const trendingBooks = [...trendingScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([bookId, score]) => ({
          bookId,
          score,
          sources: ['TRENDING'] as RecommendationSource[],
          createdAt: new Date(),
        }));

      return trendingBooks;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting trending books: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get recommendations based on user reading history
   */
  async getRecommendationsByReadingHistory(
    userId: string,
    limit = 10,
  ): Promise<BookRecommendation[]> {
    try {
      // Step 1: Get books that the user has read
      const userReadingHistory = await this.prisma.readingProgress.findMany({
        where: { userId },
        select: { bookId: true },
        distinct: ['bookId'],
      });

      const readBookIds = userReadingHistory.map((item) => item.bookId);

      if (readBookIds.length === 0) {
        return [];
      }

      // Step 2: Get genres from these books
      const bookGenres = await this.prisma.bookGenre.findMany({
        where: { bookId: { in: readBookIds } },
        select: { genreId: true },
      });

      const genreIds = [...new Set(bookGenres.map((g) => g.genreId))];

      // Step 3: Get authors from these books
      const bookAuthors = await this.prisma.bookAuthor.findMany({
        where: { bookId: { in: readBookIds } },
        select: { authorId: true },
      });

      const authorIds = [...new Set(bookAuthors.map((a) => a.authorId))];

      // Step 4: Get similar books based on these genres and authors
      const recommendations = await this.prisma.book.findMany({
        where: {
          OR: [
            {
              genres: {
                some: {
                  genreId: { in: genreIds },
                },
              },
            },
            {
              authors: {
                some: {
                  authorId: { in: authorIds },
                },
              },
            },
          ],
          id: { notIn: readBookIds },
        },
        orderBy: { totalLikes: 'desc' },
        take: limit * 2, // Get more than needed to apply scoring
      });

      // Step 5: Score books based on genre and author overlap
      const scoredBooks = await Promise.all(
        recommendations.map(async (book) => {
          // Get book's genres and authors
          const genres = await this.prisma.bookGenre.findMany({
            where: { bookId: book.id },
            select: { genreId: true },
          });

          const authors = await this.prisma.bookAuthor.findMany({
            where: { bookId: book.id },
            select: { authorId: true },
          });

          const bookGenreIds = genres.map((g) => g.genreId);
          const bookAuthorIds = authors.map((a) => a.authorId);

          // Calculate score based on genre and author overlap
          const genreOverlap =
            bookGenreIds.filter((id) => genreIds.includes(id)).length /
            Math.max(1, genreIds.length);
          const authorOverlap =
            bookAuthorIds.filter((id) => authorIds.includes(id)).length /
            Math.max(1, authorIds.length);

          // Combine scores with weights
          const score = genreOverlap * 0.6 + authorOverlap * 0.4;

          // Determine sources
          const sources: RecommendationSource[] = [];
          if (genreOverlap > 0) sources.push('GENRE_BASED');
          if (authorOverlap > 0) sources.push('AUTHOR_BASED');
          if (sources.length === 0) sources.push('USER_HISTORY');

          return {
            bookId: book.id,
            score,
            sources,
            createdAt: new Date(),
          };
        }),
      );

      // Step 6: Sort by score and limit
      return scoredBooks.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting recommendations by reading history: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get recommendations based on genre preferences
   */
  async getRecommendationsByGenres(
    genreIds: string[],
    limit = 10,
  ): Promise<BookRecommendation[]> {
    try {
      // Get all books with these genres
      const booksWithGenres = await this.prisma.bookGenre.findMany({
        where: { genreId: { in: genreIds } },
        select: { bookId: true, genreId: true },
      });

      // Group by book and count genre matches
      const bookGenreMatches = new Map<string, number>();
      booksWithGenres.forEach((item) => {
        bookGenreMatches.set(
          item.bookId,
          (bookGenreMatches.get(item.bookId) || 0) + 1,
        );
      });

      // Get book details and calculate score
      const bookScores = await Promise.all(
        [...bookGenreMatches.entries()].map(async ([bookId, matchCount]) => {
          const score = matchCount / genreIds.length;

          return {
            bookId,
            score,
            sources: ['GENRE_BASED'] as RecommendationSource[],
            createdAt: new Date(),
          };
        }),
      );

      // Sort by score and limit
      return bookScores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting recommendations by genres: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get recommendations based on author preferences
   */
  async getRecommendationsByAuthors(
    authorIds: string[],
    limit = 10,
  ): Promise<BookRecommendation[]> {
    try {
      // Get all books by these authors
      const booksByAuthors = await this.prisma.bookAuthor.findMany({
        where: { authorId: { in: authorIds } },
        select: { bookId: true, authorId: true },
      });

      // Group by book and count author matches
      const bookAuthorMatches = new Map<
        string,
        { matchCount: number; authors: Set<string> }
      >();
      booksByAuthors.forEach((item) => {
        if (!bookAuthorMatches.has(item.bookId)) {
          bookAuthorMatches.set(item.bookId, {
            matchCount: 0,
            authors: new Set(),
          });
        }

        const data = bookAuthorMatches.get(item.bookId)!;
        if (!data.authors.has(item.authorId)) {
          data.matchCount++;
          data.authors.add(item.authorId);
        }
      });

      // Calculate score based on author matches
      const bookScores = [...bookAuthorMatches.entries()].map(
        ([bookId, { matchCount }]) => {
          const score = matchCount / authorIds.length;

          return {
            bookId,
            score,
            sources: ['AUTHOR_BASED'] as RecommendationSource[],
            createdAt: new Date(),
          };
        },
      );

      // Sort by score and limit
      return bookScores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting recommendations by authors: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get recommendations based on tag preferences
   */
  async getRecommendationsByTags(
    tagIds: string[],
    limit = 10,
  ): Promise<BookRecommendation[]> {
    try {
      // Get all books with these tags
      const booksWithTags = await this.prisma.bookTag.findMany({
        where: { tagId: { in: tagIds } },
        select: { bookId: true, tagId: true },
      });

      // Group by book and count tag matches
      const bookTagMatches = new Map<string, number>();
      booksWithTags.forEach((item) => {
        bookTagMatches.set(
          item.bookId,
          (bookTagMatches.get(item.bookId) || 0) + 1,
        );
      });

      // Calculate score based on tag matches
      const bookScores = [...bookTagMatches.entries()].map(
        ([bookId, matchCount]) => {
          const score = matchCount / tagIds.length;

          return {
            bookId,
            score,
            sources: ['TAG_BASED'] as RecommendationSource[],
            createdAt: new Date(),
          };
        },
      );

      // Sort by score and limit
      return bookScores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error getting recommendations by tags: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Save user feedback about a recommendation
   * This would be used to improve future recommendations
   */
  async saveRecommendationFeedback(
    userId: string,
    bookId: string,
    liked: boolean,
  ): Promise<void> {
    try {
      // In a more complex system, we'd store this feedback
      // For now, we just use it to update book likes
      if (liked) {
        // Check if user already liked the book
        const existingLike = await this.prisma.bookLike.findUnique({
          where: {
            userId_bookId: {
              userId,
              bookId,
            },
          },
        });

        if (!existingLike) {
          // Add like
          await this.prisma.bookLike.create({
            data: {
              userId,
              bookId,
              likedAt: new Date(),
            },
          });

          // Update total likes count
          await this.prisma.book.update({
            where: { id: bookId },
            data: {
              totalLikes: {
                increment: 1,
              },
            },
          });
        }
      } else {
        // Check if user has liked the book
        const existingLike = await this.prisma.bookLike.findUnique({
          where: {
            userId_bookId: {
              userId,
              bookId,
            },
          },
        });

        if (existingLike) {
          // Remove like
          await this.prisma.bookLike.delete({
            where: {
              userId_bookId: {
                userId,
                bookId,
              },
            },
          });

          // Update total likes count
          await this.prisma.book.update({
            where: { id: bookId },
            data: {
              totalLikes: {
                decrement: 1,
              },
            },
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error saving recommendation feedback: ${errorMessage}`,
      );
      throw error;
    }
  }
}
