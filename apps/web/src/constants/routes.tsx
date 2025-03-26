export const Route = {
  Home: '/',

  Profile: '/profile',

  Book: {
    Details: '/book/details',
    Search: '/book/search',
  },

  Requests: {
    MyRequests: '/requests/my-requests',
  },

  Admin: {
    BookRequests: '/admin/book-requests',
  },
} as const;
