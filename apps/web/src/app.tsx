/* eslint-disable jsx-a11y/aria-role */
import { Routes, Route as RouteComponent } from 'react-router-dom';

import { useAuth } from './hooks';

import { Layout, RequiresRoleLayout } from '@/components/common';
import { Route } from '@/constants';
import { HomePage, ProfilePage, NoFoundPage } from '@/pages';

export function App() {
  useAuth();

  return (
    <Routes>
      <RouteComponent path={Route.Home} element={<Layout />}>
        <RouteComponent index element={<HomePage />} />

        <RouteComponent element={<RequiresRoleLayout role="USER" />}>
          <RouteComponent path={Route.Profile} element={<ProfilePage />} />
        </RouteComponent>

        <RouteComponent path="*" element={<NoFoundPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
