import { useLayoutEffect, useRef } from 'react';
import {
  Routes,
  Route as RouteComponent,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from './hooks';
import { axiosSecure } from './lib';
import { RequestsLayout } from './pages/requests/layout';
import { useAuthStore, useFilterStore } from './store';

import { Layout, RequiresRoleLayout } from '@/components/common';
import { ApiRoute, Route } from '@/constants';
import {
  HomePage,
  ProfilePage,
  NoFoundPage,
  BookDetailsPage,
  BookSearchPage,
  MyBookRequestsPage,
  AdminBookRequestsPage,
  ReadPage,
  MyFileRequestsPage,
  AdminRequestsLayout,
  AdminFileRequestsPage,
} from '@/pages';

export function App() {
  const { isReady, setIsReady, clearAccessToken } = useAuth();
  const { setAccessToken } = useAuthStore();
  const { init } = useFilterStore();
  const [searchParams] = useSearchParams();
  const hasStarted = useRef(false);

  useLayoutEffect(() => {
    (async () => {
      if (isReady || hasStarted.current) {
        return;
      }

      init(searchParams);

      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          setAccessToken(accessToken);

          await axiosSecure.get(ApiRoute.Users.Me);

          return setIsReady(true);
        } catch {
          clearAccessToken();
          localStorage.removeItem('accessToken');
          console.error('Access token is invalid!');
        }
      }

      try {
        hasStarted.current = true;
        const {
          data: { accessToken },
        } = await axiosSecure.get<{ accessToken: string }>(
          ApiRoute.Auth.Refresh,
        );

        setAccessToken(accessToken);

        setIsReady(true);
      } catch {
        clearAccessToken();
      }
    })();
  }, [isReady]);

  return (
    <Routes>
      <RouteComponent path={Route.Home} element={<Layout />}>
        <RouteComponent index element={<HomePage />} />

        <RouteComponent
          path={`${Route.Book.Details}/:id`}
          element={<BookDetailsPage />}
        />
        <RouteComponent path={Route.Book.Search} element={<BookSearchPage />} />
        <RouteComponent path={Route.Book.ReadString} element={<ReadPage />} />

        {/* User */}
        <RouteComponent element={<RequiresRoleLayout userRole="USER" />}>
          <RouteComponent path={Route.Profile} element={<ProfilePage />} />

          {/* Requests */}
          <RouteComponent element={<RequestsLayout />}>
            <RouteComponent
              path={Route.Requests.MyBookRequests}
              element={<MyBookRequestsPage />}
            />

            <RouteComponent
              path={Route.Requests.MyFileRequests}
              element={<MyFileRequestsPage />}
            />
          </RouteComponent>
        </RouteComponent>

        {/* Admin */}
        <RouteComponent element={<RequiresRoleLayout userRole="ADMIN" />}>
          <RouteComponent element={<AdminRequestsLayout />}>
            <RouteComponent
              path={Route.Admin.BookRequests}
              element={<AdminBookRequestsPage />}
            />

            <RouteComponent
              path={Route.Admin.FileRequests}
              element={<AdminFileRequestsPage />}
            />
          </RouteComponent>
        </RouteComponent>

        <RouteComponent path="*" element={<NoFoundPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
