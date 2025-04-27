import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BookRecommendation,
  IBookRepository,
  IRecommendationRepository,
  IUserRepository,
  IReadingProgressRepository,
  RecommendationParams,
  RecommendationSource,
  IBookLikeRepository,
  ITagRepository,
  IGenreRepository,
  IAuthorRepository,
} from '@read-n-feed/domain';

import {
  PersonalizedRecommendationsResponseDto,
  SimilarBooksResponseDto,
} from './recommendation.dto';

// Types for the response DTOs
export class BookRecommendationDto {
  bookId: string;
  score: number;
  sources: RecommendationSource[];
  bookDetails?: {
    title: string;
    coverImageUrl?: string | null;
    authors?: { id: string; name: string }[];
    genres?: { id: string; name: string }[];
  };
}

export class RecommendationGroupDto {
  id: string;
  title: string;
  description?: string;
  source: RecommendationSource;
  books: BookRecommendationDto[];
}

@Injectable()
export class RecommendationUseCase {
  private readonly logger = new Logger(RecommendationUseCase.name);

  constructor(
    @Inject('IRecommendationRepository')
    private readonly recommendationRepo: IRecommendationRepository,

    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,

    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,

    @Inject('IReadingProgressRepository')
    private readonly readingProgressRepo: IReadingProgressRepository,

    @Inject('IBookLikeRepository')
    private readonly bookLikeRepo: IBookLikeRepository,

    @Inject('ITagRepository')
    private readonly tagRepo: ITagRepository,

    @Inject('IGenreRepository')
    private readonly genreRepo: IGenreRepository,

    @Inject('IAuthorRepository')
    private readonly authorRepo: IAuthorRepository,
  ) {}

  /**
   * Get comprehensive personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    options: { limit?: number; includeRead?: boolean } = {},
  ): Promise<PersonalizedRecommendationsResponseDto> {
    const { limit = 20, includeRead = false } = options;

    try {
      // Check if user exists
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error(`User with id=${userId} not found`);
      }

      // Collect in-progress books for "Continue Reading" section
      const inProgressBookIds =
        await this.readingProgressRepo.findAllBooksByUser(userId);
      const inProgressBooks =
        inProgressBookIds.length > 0
          ? await Promise.all(
              inProgressBookIds.map(async (bookId) => {
                const book = await this.bookRepo.findById(bookId);
                if (!book) return null;

                const progress = await this.readingProgressRepo.find(
                  userId,
                  bookId,
                );
                if (!progress) return null;

                return {
                  bookId: book.id,
                  score: 100 - (progress.progress || 0), // Higher score for books less complete
                  sources: ['READING_PROGRESS'] as RecommendationSource[],
                  bookDetails: {
                    title: book.title,
                    coverImageUrl: book.coverImageUrl,
                  },
                  progress: progress.progress,
                };
              }),
            )
          : [];

      // Filter out nulls and sort by progress (least complete first)
      const continueReadingBooks = inProgressBooks
        .filter((book) => book !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(limit, inProgressBooks.length));

      // Build exclusion list - books to avoid recommending
      const excludeBookIds = includeRead ? [] : inProgressBookIds;

      // Get personalized recommendations
      const personalizedParams: RecommendationParams = {
        userId,
        limit,
        includeRead,
        excludeBookIds,
        genreWeighting: 1.0,
        authorWeighting: 1.0,
        tagWeighting: 0.8,
        recentActivityWeighting: 1.2,
        popularityWeighting: 0.7,
      };

      const personalizedRecommendations =
        await this.recommendationRepo.getPersonalizedRecommendations(
          personalizedParams,
        );

      // Get trending books
      const trendingBooks =
        await this.recommendationRepo.getTrendingBooks(limit);

      // Get genre-based recommendations if user has genre preferences
      const userGenreIds = await this.getUserPreferredGenres(userId);
      const genreBasedRecommendations =
        userGenreIds.length > 0
          ? await this.recommendationRepo.getRecommendationsByGenres(
              userGenreIds,
              limit,
            )
          : [];

      // Get author-based recommendations if user has author preferences
      const userAuthorIds = await this.getUserPreferredAuthors(userId);
      const authorBasedRecommendations =
        userAuthorIds.length > 0
          ? await this.recommendationRepo.getRecommendationsByAuthors(
              userAuthorIds,
              limit,
            )
          : [];

      // Enhance recommendations with book details
      const enhancedPersonalRecommendations =
        await this.enhanceRecommendationsWithBookDetails(
          personalizedRecommendations,
        );

      const enhancedTrendingRecommendations =
        await this.enhanceRecommendationsWithBookDetails(trendingBooks);

      const enhancedGenreRecommendations =
        await this.enhanceRecommendationsWithBookDetails(
          genreBasedRecommendations,
        );

      const enhancedAuthorRecommendations =
        await this.enhanceRecommendationsWithBookDetails(
          authorBasedRecommendations,
        );

      // Build the response with recommendation groups
      const response: PersonalizedRecommendationsResponseDto = {
        forYou: {
          id: 'for-you',
          title: 'Recommended For You',
          description: 'Personalized picks based on your reading preferences',
          source: 'USER_HISTORY',
          books: enhancedPersonalRecommendations,
        },
        trending: {
          id: 'trending',
          title: 'Trending Now',
          description: 'Popular books that readers are enjoying',
          source: 'TRENDING',
          books: enhancedTrendingRecommendations,
        },
      };

      // Only add groups that have recommendations
      if (enhancedGenreRecommendations.length > 0) {
        response.basedOnGenres = {
          id: 'genres',
          title: 'Based On Your Favorite Genres',
          source: 'GENRE_BASED',
          books: enhancedGenreRecommendations,
        };
      }

      if (enhancedAuthorRecommendations.length > 0) {
        response.basedOnAuthors = {
          id: 'authors',
          title: 'More From Authors You Like',
          source: 'AUTHOR_BASED',
          books: enhancedAuthorRecommendations,
        };
      }

      if (continueReadingBooks.length > 0) {
        response.continueReading = {
          id: 'continue-reading',
          title: 'Continue Reading',
          description: 'Pick up where you left off',
          source: 'READING_PROGRESS',
          books: continueReadingBooks as BookRecommendationDto[],
        };
      }

      return response;
    } catch (error: unknown) {
      this.logger.error(
        `Error getting personalized recommendations: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Get similar books to a specified book
   */
  async getSimilarBooks(
    bookId: string,
    limit = 10,
  ): Promise<SimilarBooksResponseDto> {
    try {
      // Validate book exists
      const book = await this.bookRepo.findById(bookId);
      if (!book) {
        throw new Error(`Book with id=${bookId} not found`);
      }

      // Get similar books
      const similarBooks = await this.recommendationRepo.getSimilarBooks(
        bookId,
        limit,
      );

      // Enhance recommendations with book details
      const enhancedRecommendations =
        await this.enhanceRecommendationsWithBookDetails(similarBooks);

      return {
        originalBookId: bookId,
        originalBookTitle: book.title,
        recommendations: enhancedRecommendations,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error getting similar books: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Get recommendations based on a specific genre
   */
  async getRecommendationsByGenre(
    genreId: string,
    limit = 10,
  ): Promise<RecommendationGroupDto> {
    try {
      // Validate genre exists
      const genre = await this.genreRepo.findById(genreId);
      if (!genre) {
        throw new Error(`Genre with id=${genreId} not found`);
      }

      // Get recommendations by genre
      const recommendations =
        await this.recommendationRepo.getRecommendationsByGenres(
          [genreId],
          limit,
        );

      // Enhance recommendations with book details
      const enhancedRecommendations =
        await this.enhanceRecommendationsWithBookDetails(recommendations);

      return {
        id: `genre-${genreId}`,
        title: `Books in ${genre.name}`,
        source: 'GENRE_BASED',
        books: enhancedRecommendations,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error getting recommendations by genre: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Get recommendations based on a specific author
   */
  async getRecommendationsByAuthor(
    authorId: string,
    limit = 10,
  ): Promise<RecommendationGroupDto> {
    try {
      // Validate author exists
      const author = await this.authorRepo.findById(authorId);
      if (!author) {
        throw new Error(`Author with id=${authorId} not found`);
      }

      // Get recommendations by author
      const recommendations =
        await this.recommendationRepo.getRecommendationsByAuthors(
          [authorId],
          limit,
        );

      // Enhance recommendations with book details
      const enhancedRecommendations =
        await this.enhanceRecommendationsWithBookDetails(recommendations);

      return {
        id: `author-${authorId}`,
        title: `Books by ${author.name}`,
        source: 'AUTHOR_BASED',
        books: enhancedRecommendations,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error getting recommendations by author: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Save user feedback about a recommendation to improve future recommendations
   */
  async saveRecommendationFeedback(
    userId: string,
    bookId: string,
    liked: boolean,
  ): Promise<void> {
    try {
      await this.recommendationRepo.saveRecommendationFeedback(
        userId,
        bookId,
        liked,
      );
      this.logger.log(
        `Saved recommendation feedback from user ${userId} for book ${bookId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error saving recommendation feedback: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Helper function to get user's preferred genres based on reading history and likes
   */
  private async getUserPreferredGenres(userId: string): Promise<string[]> {
    // Get books that user has read or liked
    const readBookIds =
      await this.readingProgressRepo.findAllBooksByUser(userId);

    // If no reading history, return empty array
    if (readBookIds.length === 0) {
      return [];
    }

    // Collect all genre IDs from these books
    const genreIdsMap = new Map<string, number>();

    await Promise.all(
      readBookIds.map(async (bookId) => {
        const genreIds = await this.bookRepo.getBookGenres(bookId);
        genreIds.forEach((genreId) => {
          genreIdsMap.set(genreId, (genreIdsMap.get(genreId) || 0) + 1);
        });
      }),
    );

    // Sort by frequency and return top genres
    return [...genreIdsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([genreId]) => genreId)
      .slice(0, 5); // Get top 5 genres
  }

  /**
   * Helper function to get user's preferred authors based on reading history and likes
   */
  private async getUserPreferredAuthors(userId: string): Promise<string[]> {
    // Get books that user has read or liked
    const readBookIds =
      await this.readingProgressRepo.findAllBooksByUser(userId);

    // If no reading history, return empty array
    if (readBookIds.length === 0) {
      return [];
    }

    // Collect all author IDs from these books
    const authorIdsMap = new Map<string, number>();

    await Promise.all(
      readBookIds.map(async (bookId) => {
        const authorIds = await this.bookRepo.getBookAuthors(bookId);
        authorIds.forEach((authorId) => {
          authorIdsMap.set(authorId, (authorIdsMap.get(authorId) || 0) + 1);
        });
      }),
    );

    // Sort by frequency and return top authors
    return [...authorIdsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([authorId]) => authorId)
      .slice(0, 5); // Get top 5 authors
  }

  /**
   * Helper function to enhance recommendations with book details
   */
  private async enhanceRecommendationsWithBookDetails(
    recommendations: BookRecommendation[],
  ): Promise<BookRecommendationDto[]> {
    return Promise.all(
      recommendations.map(async (rec) => {
        const book = await this.bookRepo.findById(rec.bookId);
        if (!book) {
          return {
            bookId: rec.bookId,
            score: rec.score,
            sources: rec.sources,
          };
        }

        const bookRelationships = await this.bookRepo.findByIdWithRelationships(
          rec.bookId,
        );

        const authors = bookRelationships
          ? await Promise.all(
              bookRelationships.authorIds.map(async (authorId) => {
                const author = await this.authorRepo.findById(authorId);
                return author ? { id: author.id, name: author.name } : null;
              }),
            ).then((items) =>
              items.filter(
                (item): item is { id: string; name: string } => item !== null,
              ),
            )
          : [];

        const genres = bookRelationships
          ? await Promise.all(
              bookRelationships.genreIds.map(async (genreId) => {
                const genre = await this.genreRepo.findById(genreId);
                return genre ? { id: genre.id, name: genre.name } : null;
              }),
            ).then((items) =>
              items.filter(
                (item): item is { id: string; name: string } => item !== null,
              ),
            )
          : [];

        return {
          bookId: rec.bookId,
          score: rec.score,
          sources: rec.sources,
          bookDetails: {
            title: book.title,
            coverImageUrl: book.coverImageUrl,
            authors,
            genres,
          },
        };
      }),
    );
  }
}
