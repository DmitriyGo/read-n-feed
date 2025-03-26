import { RouteValue, StringRecord } from '@/types';

enum ApiControllers {
  Auth = 'auth',
  Users = 'users',
  Books = 'books',
  Requests = 'book-requests',
  BookFiles = 'book-files',
  Comments = 'comments',
  Authors = 'authors',
  Genres = 'genres',
  Tags = 'tags',
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
  Requests: {
    Base: `${ApiControllers.Requests}/`,
    Create: `${ApiControllers.Requests}/`,
    GetAll: `${ApiControllers.Requests}/`,
    MyRequests: `${ApiControllers.Requests}/my-requests`,
    Id: (requestId: string) => `${ApiControllers.Requests}/${requestId}`,
    Update: (requestId: string) => `${ApiControllers.Requests}/${requestId}`,
    Review: (requestId: string) =>
      `${ApiControllers.Requests}/${requestId}/review`,
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
} as const satisfies Record<keyof typeof ApiControllers, RouteValue>;
