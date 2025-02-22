/* eslint-disable jsx-a11y/aria-role */
import { useLayoutEffect } from 'react';
import { Routes, Route as RouteComponent } from 'react-router-dom';

import { useAuth } from './hooks';
import { axiosSecure } from './lib';
import { useAuthStore } from './store';

import { Layout, RequiresRoleLayout } from '@/components/common';
import { ApiRoute, Route } from '@/constants';
import { HomePage, ProfilePage, NoFoundPage, BookDetailsPage } from '@/pages';

export function App() {
  const { isReady, setIsReady, clearAccessToken } = useAuth();
  const { setAccessToken } = useAuthStore();

  useLayoutEffect(() => {
    (async () => {
      if (isReady) {
        return;
      }

      try {
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

        <RouteComponent element={<RequiresRoleLayout role="USER" />}>
          <RouteComponent path={Route.Profile} element={<ProfilePage />} />
        </RouteComponent>

        <RouteComponent
          path={`${Route.Book.Details}/:id`}
          element={<BookDetailsPage />}
        />

        <RouteComponent path="*" element={<NoFoundPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
