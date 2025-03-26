import { isDefined } from '@read-n-feed/shared';
import { useNavigate } from 'react-router-dom';

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

  const handleMyRequests = () => {
    navigate(Route.Requests.MyRequests);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar src={data?.data.avatarUrl} />
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-4" align="end">
        {isDefined(accessToken) ? (
          <>
            <Button onClick={handleSeeProfile}>See Profile</Button>

            <Button variant="outline" onClick={handleMyRequests}>
              My Requests
            </Button>

            <Button onClick={handleLogout} variant="destructive">
              LogOut
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
