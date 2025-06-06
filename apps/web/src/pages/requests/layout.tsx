import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Route } from '@/constants';

export const RequestsLayout = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const RequestsRoutes = useMemo(
    () => [
      {
        name: t('myBookRequests'),
        href: Route.Requests.MyBookRequests,
      },
      {
        name: t('myFileRequests'),
        href: Route.Requests.MyFileRequests,
      },
    ],
    [i18n.language, t],
  );

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
