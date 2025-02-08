import { isNotEmpty } from 'class-validator';
import { useNavigate } from 'react-router-dom';

import { Conditional } from '../conditional';

import {
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { Route } from '@/constants';
import { useAuth } from '@/hooks';
import { useGetProfile } from '@/hooks/read';
import { useLogout } from '@/hooks/write';
import { useModalStore } from '@/store';

export const Profile = () => {
  const navigate = useNavigate();

  const { setMode } = useModalStore();

  const { accessToken } = useAuth();
  const { mutateAsync: logout } = useLogout();

  const { data } = useGetProfile();

  const handleLogout = () => {
    logout();
  };

  const handleSeeProfile = () => {
    navigate(Route.Profile);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar src={data?.data.avatarUrl} />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-4" align="end">
        <Conditional condition={isNotEmpty(accessToken)}>
          <Conditional.True>
            <Button onClick={handleSeeProfile}>See Profile</Button>

            <Button onClick={handleLogout} variant="destructive">
              LogOut
            </Button>
          </Conditional.True>

          <Conditional.False>
            <Button
              variant="secondary"
              onClick={() => {
                setMode('SignIn');
              }}
            >
              SignIn
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMode('SignUp');
              }}
            >
              SignUp
            </Button>
          </Conditional.False>
        </Conditional>
      </PopoverContent>
    </Popover>
  );
};
