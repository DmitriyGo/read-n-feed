import { Link } from 'react-router-dom';

import { Route } from '@/constants';

export const Header = () => {
  return (
    <nav className="w-full border-b-2 border-border bg-card py-4 mb-4">
      <ul className="flex w-full justify-evenly flex-row gap-4">
        <li>
          <Link to={Route.Home}>Home</Link>
        </li>
        <li>
          <Link to={Route.Profile}>Profile</Link>
        </li>
      </ul>
    </nav>
  );
};
