import { RouteValue } from '@/types';

export const Route = {
  Home: '/',

  Profile: '/profile',

  Book: {
    Details: '/book/details',
    Search: '/book/search',
    ReadString: '/read/:bookOrRequestId/:fileId',
    Read: (bookOrRequestId: string, fileId: string) =>
      `/read/${bookOrRequestId}/${fileId}`,
  },

  Requests: {
    MyRequests: '/requests/my-requests',
  },

  Admin: {
    BookRequests: '/admin/book-requests',
  },
} as const satisfies Record<string, RouteValue>;
