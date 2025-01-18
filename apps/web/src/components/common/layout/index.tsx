import { Outlet } from 'react-router-dom';

import { ModalManager } from '../modal-manager';
import { Header } from './header';

export const Layout = () => {
  return (
    <>
      <Header />

      <ModalManager />

      <Outlet />
    </>
  );
};
