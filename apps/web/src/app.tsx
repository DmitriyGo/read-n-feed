import { Routes, Route as RouteComponent } from 'react-router-dom';

import { useAuth } from './hooks';

import { Layout } from '@/components/common';
import { Route } from '@/constants';
import { HomePage, ProfilePage, NoFoundPage } from '@/pages';

export function App() {
  useAuth();

  return (
    <Routes>
      <RouteComponent path={Route.Home} element={<Layout />}>
        <RouteComponent index element={<HomePage />} />

        <RouteComponent path={Route.Profile} element={<ProfilePage />} />

        <RouteComponent path="*" element={<NoFoundPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
