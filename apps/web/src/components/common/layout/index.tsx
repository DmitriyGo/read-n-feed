import { UserRole } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Header } from './header';
import { FullPageLoader } from '../loader';
import { ModalManager } from '../modal-manager';

import { Route } from '@/constants';
import { useHasRole } from '@/hooks';

export const Layout = () => {
  return (
    <>
      <Header />

      <ModalManager />

      <div className="container">
        <Outlet />
      </div>
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

  return isLoadingOrRefetching ? <FullPageLoader /> : <Outlet />;
};
