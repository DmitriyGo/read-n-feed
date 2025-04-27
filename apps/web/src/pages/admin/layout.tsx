import { Link, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Route } from '@/constants';

const RequestsRoutes = [
  {
    name: 'User Book Requests',
    href: Route.Admin.BookRequests,
  },
  {
    name: 'User File Requests',
    href: Route.Admin.FileRequests,
  },
];

export const AdminRequestsLayout = () => {
  const location = useLocation();

  return (
    <div>
      <nav className="flex gap-4 mb-4">
        {RequestsRoutes.map((route) => (
          <Link key={route.name} to={route.href}>
            <Button
              variant={
                location.pathname.includes(route.href) ? 'default' : 'outline'
              }
            >
              {route.name}
            </Button>
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};
