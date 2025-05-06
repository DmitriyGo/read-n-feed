export const QueryKey = {
  Auth: {
    Profile: 'auth.profile',
    Sessions: 'auth.sessions',
  },
  Users: {
    Profile: 'users.profile',
    Details: (userId: string) => ['users.details', userId],
  },
  Books: {
    Catalog: 'books.catalog',
    Details: (bookId: string) => ['books.details', bookId],
    Files: (bookId: string) => ['books.files', bookId],
    MostLiked: 'books.mostLiked',
    Liked: 'books.liked',
    Related: (bookId: string) => ['books.related', bookId],
    Authors: (bookId: string) => ['books.authors', bookId],
    Genres: (bookId: string) => ['books.genres', bookId],
    Tags: (bookId: string) => ['books.tags', bookId],
  },
  ReadingProgress: {
    Book: (bookId: string) => ['reading-progress.book', bookId],
    InProgress: 'reading-progress.in-progress',
  },
  BookRequests: {
    All: 'book-requests.all',
    MyRequests: 'book-requests.my',
    Details: (requestId: string) => ['book-requests.details', requestId],
    Files: (requestId: string) => ['book-requests.files', requestId],
  },
  BookFiles: {
    ForBook: (bookId: string) => ['book-files.forBook', bookId],
    ForRequest: (requestId: string) => ['book-files.forRequest', requestId],
    Metadata: (fileId: string) => ['book-files.metadata', fileId],
    DownloadUrl: (fileId: string) => ['book-files.downloadUrl', fileId],
  },
  FileRequests: {
    All: 'file-requests.all',
    MyRequests: 'file-requests.my',
    Details: (requestId: string) => ['file-requests.details', requestId],
  },
  Comments: {
    ForBook: (bookId: string) => ['comments.forBook', bookId],
    Details: (commentId: string) => ['comments.details', commentId],
  },
  Authors: {
    All: 'authors.all',
    Details: (authorId: string) => ['authors.details', authorId],
  },
  Genres: {
    All: 'genres.all',
    Details: (genreId: string) => ['genres.details', genreId],
  },
  Tags: {
    All: 'tags.all',
    Details: (tagId: string) => ['tags.details', tagId],
  },
  Recommendations: {
    Personal: 'recommendations.personal',
  },
};
