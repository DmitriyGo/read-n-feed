export type RecommendationSource =
  | 'GENRE_BASED'
  | 'AUTHOR_BASED'
  | 'TAG_BASED'
  | 'USER_HISTORY'
  | 'SIMILAR_USERS'
  | 'READING_PROGRESS'
  | 'TRENDING'
  | 'NEW_RELEASES'
  | 'EDITOR_CHOICE';

export interface BookRecommendation {
  bookId: string;
  score: number;
  sources: RecommendationSource[];
  createdAt: Date;
}

export interface RecommendationGroup {
  id: string;
  title: string;
  description?: string;
  recommendations: BookRecommendation[];
  source: RecommendationSource;
}

export interface RecommendationParams {
  userId: string;
  limit?: number;
  includeRead?: boolean;
  genreWeighting?: number;
  tagWeighting?: number;
  authorWeighting?: number;
  recentActivityWeighting?: number;
  popularityWeighting?: number;
  excludeBookIds?: string[];
}

export interface IRecommendationRepository {
  getPersonalizedRecommendations(
    params: RecommendationParams,
  ): Promise<BookRecommendation[]>;

  getSimilarBooks(
    bookId: string,
    limit?: number,
  ): Promise<BookRecommendation[]>;

  // most read/liked recently
  getTrendingBooks(limit?: number): Promise<BookRecommendation[]>;

  getRecommendationsByReadingHistory(
    userId: string,
    limit?: number,
  ): Promise<BookRecommendation[]>;

  getRecommendationsByGenres(
    genreIds: string[],
    limit?: number,
  ): Promise<BookRecommendation[]>;

  getRecommendationsByAuthors(
    authorIds: string[],
    limit?: number,
  ): Promise<BookRecommendation[]>;

  getRecommendationsByTags(
    tagIds: string[],
    limit?: number,
  ): Promise<BookRecommendation[]>;

  // Save user recommendation feedback (e.g., if they liked/disliked a recommendation)
  saveRecommendationFeedback(
    userId: string,
    bookId: string,
    liked: boolean,
  ): Promise<void>;
}
