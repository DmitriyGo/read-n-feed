import { Routes, Route as RouteComponent } from 'react-router-dom';

import { Layout } from '@/components/common';
import { Route } from '@/constants';
import { HomePage, ProfilePage } from '@/pages';

export function App() {
  return (
    <Routes>
      <RouteComponent path={Route.Home} element={<Layout />}>
        <RouteComponent index element={<HomePage />} />

        <RouteComponent path={Route.Profile} element={<ProfilePage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
