import { Link } from 'react-router-dom';

import { Route } from '@/constants';

export const Header = () => {
  return (
    <nav className="w-full border-b-2 border-border bg-card py-4 text-white">
      <ul className="flex w-full justify-evenly flex-row gap-4">
        <li>
          <Link to={Route.Home}>Home</Link>
        </li>
        <li>
          <Link to={Route.SignIn}>Sign In</Link>
        </li>
        <li>
          <Link to={Route.SignUp}>Sign Up</Link>
        </li>
      </ul>
    </nav>
  );
};