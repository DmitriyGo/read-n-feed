import { Link } from 'react-router-dom';

import { Profile } from './profile';

import { Route } from '@/constants';

export const Header = () => {
  return (
    <nav className="w-full flex flex-row items-center border-b-2 border-border bg-card py-3 px-12 mb-4">
      <ul className="flex w-full justify-evenly flex-row gap-4">
        <li>
          <Link to={Route.Home}>Home</Link>
        </li>
        <li>
          <Link to={Route.Book.Search}>Catalogue</Link>
        </li>
      </ul>

      <Profile />
    </nav>
  );
};
