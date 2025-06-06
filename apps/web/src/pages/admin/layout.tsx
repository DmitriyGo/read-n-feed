import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Route } from '@/constants';

export const AdminRequestsLayout = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const RequestsRoutes = useMemo(
    () => [
      {
        name: t('userBookRequests'),
        href: Route.Admin.BookRequests,
      },
      {
        name: t('userFileRequests'),
        href: Route.Admin.FileRequests,
      },
    ],
    [i18n.language, t],
  );

  return (
    <div>
      <nav className="flex gap-4 mb-4 max-md:flex-col">
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
