import { RouteValue } from '@/types';

enum ApiControllers {
  Auth = 'auth',
  Users = 'users',
  Books = 'books',
  BookRequests = 'book-requests',
  BookFiles = 'book-files',
  Comments = 'comments',
  Authors = 'authors',
  Genres = 'genres',
  Tags = 'tags',
  ReadingProgress = 'reading-progress',
  FileRequests = 'book-file-requests',
  FileRequestsAdmin = 'admin/book-file-requests',
  Recommendations = 'recommendations',
}

export const ApiRoute = {
  Auth: {
    Register: `${ApiControllers.Auth}/register`,
    Login: `${ApiControllers.Auth}/login`,
    Logout: `${ApiControllers.Auth}/logout`,
    LogoutAll: `${ApiControllers.Auth}/logout-all`,
    Refresh: `${ApiControllers.Auth}/refresh`,
    Sessions: `${ApiControllers.Auth}/sessions`,
    RevokeSession: (sessionId: string) =>
      `${ApiControllers.Auth}/sessions/${sessionId}`,
  },
  Users: {
    Me: `${ApiControllers.Users}/me`,
    UpdateMe: `${ApiControllers.Users}/me`,
    Get: (userId: string) => `${ApiControllers.Users}/${userId}`,
    Block: (userId: string) => `${ApiControllers.Users}/${userId}/block`,
    Unblock: (userId: string) => `${ApiControllers.Users}/${userId}/unblock`,
  },
  Books: {
    Base: `${ApiControllers.Books}/`,
    Search: `${ApiControllers.Books}/`,
    Create: `${ApiControllers.Books}/`,
    Id: (bookId: string) => `${ApiControllers.Books}/${bookId}`,
    MostLiked: (limit?: number) =>
      limit
        ? `${ApiControllers.Books}/most-liked/${limit}`
        : `${ApiControllers.Books}/most-liked`,
    Related: (bookId: string) => `${ApiControllers.Books}/${bookId}/related`,
    Authors: {
      Get: (bookId: string) => `${ApiControllers.Books}/${bookId}/authors`,
      Add: (bookId: string) => `${ApiControllers.Books}/${bookId}/authors`,
      Remove: (bookId: string) => `${ApiControllers.Books}/${bookId}/authors`,
    },
    Genres: {
      Get: (bookId: string) => `${ApiControllers.Books}/${bookId}/genres`,
      Add: (bookId: string) => `${ApiControllers.Books}/${bookId}/genres`,
      Remove: (bookId: string) => `${ApiControllers.Books}/${bookId}/genres`,
    },
    Tags: {
      Get: (bookId: string) => `${ApiControllers.Books}/${bookId}/tags`,
      Add: (bookId: string) => `${ApiControllers.Books}/${bookId}/tags`,
      Remove: (bookId: string) => `${ApiControllers.Books}/${bookId}/tags`,
    },
    Like: (bookId: string) => `${ApiControllers.Books}/${bookId}/like`,
    Unlike: (bookId: string) => `${ApiControllers.Books}/${bookId}/like`,
  },
  ReadingProgress: {
    Save: `${ApiControllers.ReadingProgress}/`,
    GetForBook: (bookId: string) =>
      `${ApiControllers.ReadingProgress}/book/${bookId}`,
    GetForBookAllDevices: (bookId: string) =>
      `${ApiControllers.ReadingProgress}/book/${bookId}/all-devices`,
    GetInProgress: `${ApiControllers.ReadingProgress}/in-progress`,
  },
  BookRequests: {
    Base: `${ApiControllers.BookRequests}/`,
    Create: `${ApiControllers.BookRequests}/`,
    GetAll: `${ApiControllers.BookRequests}/`,
    MyRequests: `${ApiControllers.BookRequests}/my-requests`,
    Id: (requestId: string) => `${ApiControllers.BookRequests}/${requestId}`,
    Update: (requestId: string) =>
      `${ApiControllers.BookRequests}/${requestId}`,
    Review: (requestId: string) =>
      `${ApiControllers.BookRequests}/${requestId}/review`,
  },
  BookFiles: {
    Upload: `${ApiControllers.BookFiles}/upload`,
    Download: (fileId: string) =>
      `${ApiControllers.BookFiles}/download/${fileId}`,
    View: (fileId: string) => `${ApiControllers.BookFiles}/view/${fileId}`,
    GetUrl: (fileId: string) => `${ApiControllers.BookFiles}/url/${fileId}`,
    Delete: (fileId: string) => `${ApiControllers.BookFiles}/${fileId}`,
    GetForBook: (bookId: string) =>
      `${ApiControllers.BookFiles}/book/${bookId}`,
    GetForBookRequest: (requestId: string) =>
      `${ApiControllers.BookFiles}/book-request/${requestId}`,
    GetMetadata: (fileId: string) =>
      `${ApiControllers.BookFiles}/metadata/${fileId}`,
  },
  FileRequests: {
    Create: `${ApiControllers.FileRequests}/`,
    MyRequests: `${ApiControllers.FileRequests}/my-requests`,
    Get: (requestId: string) => `${ApiControllers.FileRequests}/${requestId}`,
    Delete: (requestId: string) =>
      `${ApiControllers.FileRequests}/${requestId}`,
    AssociateFile: (requestId: string, fileId: string) =>
      `${ApiControllers.FileRequests}/${requestId}/associate-file/${fileId}`,
  },
  FileRequestsAdmin: {
    GetAll: `${ApiControllers.FileRequestsAdmin}/`,
    Review: (requestId: string) =>
      `${ApiControllers.FileRequestsAdmin}/${requestId}/review`,
    Get: (requestId: string) =>
      `${ApiControllers.FileRequestsAdmin}/${requestId}`,
    GetForBook: (bookId: string) =>
      `${ApiControllers.FileRequestsAdmin}/book/${bookId}`,
  },
  Comments: {
    Create: `${ApiControllers.Comments}/`,
    Get: (commentId: string) => `${ApiControllers.Comments}/${commentId}`,
    Update: (commentId: string) => `${ApiControllers.Comments}/${commentId}`,
    Delete: (commentId: string) => `${ApiControllers.Comments}/${commentId}`,
    GetForBook: (bookId: string) => `${ApiControllers.Comments}/book/${bookId}`,
  },
  Authors: {
    Create: `${ApiControllers.Authors}/`,
    Search: `${ApiControllers.Authors}/`,
    Get: (authorId: string) => `${ApiControllers.Authors}/${authorId}`,
    Update: (authorId: string) => `${ApiControllers.Authors}/${authorId}`,
    Delete: (authorId: string) => `${ApiControllers.Authors}/${authorId}`,
  },
  Genres: {
    Create: `${ApiControllers.Genres}/`,
    GetAll: `${ApiControllers.Genres}/`,
    Get: (genreId: string) => `${ApiControllers.Genres}/${genreId}`,
    Update: (genreId: string) => `${ApiControllers.Genres}/${genreId}`,
    Delete: (genreId: string) => `${ApiControllers.Genres}/${genreId}`,
  },
  Tags: {
    Create: `${ApiControllers.Tags}/`,
    GetAll: `${ApiControllers.Tags}/`,
    Get: (tagId: string) => `${ApiControllers.Tags}/${tagId}`,
    Update: (tagId: string) => `${ApiControllers.Tags}/${tagId}`,
    Delete: (tagId: string) => `${ApiControllers.Tags}/${tagId}`,
  },
  Recommendations: {
    GetPersonalized: `${ApiControllers.Recommendations}/`,
    GetSimilar: (bookId: string) =>
      `${ApiControllers.Recommendations}/similar/${bookId}`,
    GetByGenre: (genreId: string) =>
      `${ApiControllers.Recommendations}/genre/${genreId}`,
    GetByAuthor: (authorId: string) =>
      `${ApiControllers.Recommendations}/author/${authorId}`,
    SaveFeedback: `${ApiControllers.Recommendations}/feedback`,
  },
} as const satisfies Record<keyof typeof ApiControllers, RouteValue>;
