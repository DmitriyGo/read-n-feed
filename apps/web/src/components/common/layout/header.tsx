import { isNotEmpty } from 'class-validator';
import { Link } from 'react-router-dom';

import { Conditional } from '../conditional';

import { Avatar, Button } from '@/components/ui';
import { Route } from '@/constants';
import { useAuth } from '@/hooks';
import { useLogout } from '@/hooks/write';
import { useModalStore } from '@/store';

export const Header = () => {
  const { setMode } = useModalStore();

  const { accessToken } = useAuth();
  const { mutateAsync: logout } = useLogout();

  return (
    <nav className="w-full border-b-2 border-border bg-card py-4 mb-4">
      <ul className="flex w-full justify-evenly flex-row gap-4">
        <li>
          <Link to={Route.Home}>Home</Link>
        </li>
      </ul>

      <Conditional condition={isNotEmpty(accessToken)}>
        <Conditional.True>
          <Avatar />

          <Button onClick={() => logout()} variant="secondary">
            LogOut
          </Button>
        </Conditional.True>

        <Conditional.False>
          <Button
            variant="destructive"
            onClick={() => {
              setMode('SignIn');
            }}
          >
            SignIn
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setMode('SignUp');
            }}
          >
            SignUp
          </Button>
        </Conditional.False>
      </Conditional>
    </nav>
  );
};
