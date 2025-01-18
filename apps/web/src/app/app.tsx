import { Routes, Route as RouteComponent } from 'react-router-dom';

import { Layout } from '@/components/common/layout';
import { Route } from '@/constants';
import { HomePage, SignInPage, SignUpPage } from '@/pages';

export function App() {
  return (
    <Routes>
      <RouteComponent path={Route.Home} element={<Layout />}>
        <RouteComponent index element={<HomePage />} />

        <RouteComponent path={Route.SignIn} element={<SignInPage />} />
        <RouteComponent path={Route.SignUp} element={<SignUpPage />} />
      </RouteComponent>
    </Routes>
  );
}

export default App;
