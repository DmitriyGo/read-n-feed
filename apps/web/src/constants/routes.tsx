import { RouteValue } from '@/types';

export const Route = {
  Home: '/',

  Profile: '/profile',

  Book: {
    Details: '/book/details',
    Search: '/book/search',
    ReadString: '/read/:bookOrRequestId/:fileId/:type',
    Read: (
      bookOrRequestId: string,
      fileId: string,
      type: 'book' | 'request' | 'file-request',
    ) => `/read/${bookOrRequestId}/${fileId}/${type}`,
  },

  Requests: {
    MyBookRequests: '/requests/my-book-requests',
    MyFileRequests: '/requests/my-file-requests',
  },

  Admin: {
    BookRequests: '/admin/book-requests',
  },
} as const satisfies Record<string, RouteValue>;
