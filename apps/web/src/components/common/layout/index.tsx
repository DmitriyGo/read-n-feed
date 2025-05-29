import { UserRole } from '@read-n-feed/domain';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Header } from './header';
import { FullPageLoader } from '../loader';
import { ModalManager } from '../modal-manager';
import { Footer } from './footer';

import { Route } from '@/constants';
import { useHasRole } from '@/hooks';

export const Layout = () => {
  return (
    <>
      <Header />

      <ModalManager />

      <div className="container min-h-[85vh]">
        <Outlet />
      </div>

      <Footer />
    </>
  );
};

export const RequiresRoleLayout = ({ userRole }: { userRole: UserRole }) => {
  const navigate = useNavigate();
  const { isReady, hasRole, isLoadingOrRefetching } = useHasRole(userRole);

  useEffect(() => {
    if (isReady && !isLoadingOrRefetching) {
      if (!hasRole) {
        navigate(Route.Home);
      }
    }
  }, [hasRole, isLoadingOrRefetching, isReady, navigate, userRole]);

  return (
    <>
      {(isLoadingOrRefetching || !isReady) && <FullPageLoader />}
      <Outlet />
    </>
  );
};
