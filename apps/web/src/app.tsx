import { useLayoutEffect, useRef } from 'react';
import {
  Routes,
  Route as RouteComponent,
  useSearchParams,
} from 'react-router-dom';

import { authApi } from './api/auth.api';
import { useAuth, useCurrentUser } from './hooks';
import { RequestsLayout } from './pages/requests/layout';
import { useFilterStore } from './store';

import { Layout, RequiresRoleLayout } from '@/components/common';
import { Route } from '@/constants';
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
  const {
    isReady,
    setIsReady,
    clearAuthData,
    handleSetAccessToken,
    handleSetUser,
  } = useAuth();
  const { init } = useFilterStore();
  const [searchParams] = useSearchParams();
  const hasStarted = useRef(false);

  // This will automatically fetch user data when accessToken is available
  useCurrentUser();

  useLayoutEffect(() => {
    (async () => {
      if (isReady || hasStarted.current) {
        return;
      }

      hasStarted.current = true;
      init(searchParams);

      try {
        const { accessToken: newToken } = await authApi.refresh();
        handleSetAccessToken(newToken);

        const userData = await authApi.getCurrentUser();
        handleSetUser(userData);
      } catch {
        clearAuthData();
      }

      setIsReady(true);
    })();
  }, [
    isReady,
    handleSetAccessToken,
    handleSetUser,
    clearAuthData,
    setIsReady,
    init,
    searchParams,
  ]);

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
