import { RouteValue } from '@/types';

export const Route = {
  Home: '/',

  Profile: '/profile',

  Book: {
    Details: '/book/details',
    Search: '/book/search',
    ReadString: '/read/:bookId/:fileId',
    Read: (bookId: string, fileId: string) => `/read/${bookId}/${fileId}`,
  },

  Requests: {
    MyRequests: '/requests/my-requests',
  },

  Admin: {
    BookRequests: '/admin/book-requests',
  },
} as const satisfies Record<string, RouteValue>;
