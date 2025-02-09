import { UserRole } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Header } from './header';
import { ModalManager } from '../modal-manager';

import { Route } from '@/constants';
import { useAuth } from '@/hooks';
import { useGetProfile } from '@/hooks/read';

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

export const RequiresRoleLayout = ({ role }: { role: UserRole }) => {
  const navigate = useNavigate();
  const { isReady } = useAuth();
  const { data: profile, isLoading, isRefetching } = useGetProfile();
  const isLoadingOrRefetching = isLoading || isRefetching;

  useEffect(() => {
    if (isReady && !isLoadingOrRefetching) {
      const hasRequiredRole =
        isDefined(profile) && isDefined(profile.data.roles)
          ? profile.data.roles.some((userRole) => userRole === role)
          : false;

      if (!hasRequiredRole) {
        navigate(Route.Home);
      }
    }
  }, [isLoadingOrRefetching, isReady, navigate, profile, role]);

  return <Outlet />;
};
