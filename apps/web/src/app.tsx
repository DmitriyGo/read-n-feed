import { UserResponseDto } from '@read-n-feed/application';
import { User } from '@read-n-feed/domain';
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

        <RouteComponent element={<RequiresRoleLayout userRole="USER" />}>
          <RouteComponent path={Route.Profile} element={<ProfilePage />} />

          <RouteComponent element={<RequestsLayout />}>
            <RouteComponent
              path={Route.Requests.MyBookRequests}
              element={<MyBookRequestsPage />}
            />
          </RouteComponent>
        </RouteComponent>

        <RouteComponent element={<RequiresRoleLayout userRole="ADMIN" />}>
          <RouteComponent
            path={Route.Admin.BookRequests}
            element={<AdminBookRequestsPage />}
          />
        </RouteComponent>

        <RouteComponent
          path={`${Route.Book.Details}/:id`}
          element={<BookDetailsPage />}
        />
        <RouteComponent path={Route.Book.ReadString} element={<ReadPage />} />

        <RouteComponent path={Route.Book.Search} element={<BookSearchPage />} />

        <RouteComponent path="*" element={<NoFoundPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
