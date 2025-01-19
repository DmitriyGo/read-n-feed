import { Outlet } from 'react-router-dom';

import { Header } from './header';
import { ModalManager } from '../modal-manager';

export const Layout = () => {
  return (
    <>
      <Header />

      <ModalManager />

      <Outlet />
    </>
  );
};
