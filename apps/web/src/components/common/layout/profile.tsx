import { isDefined } from '@read-n-feed/shared';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    navigate(Route.Requests.MyBookRequests);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar src={data?.data.avatarUrl} />
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-4" align="end">
        {isDefined(accessToken) ? (
          <>
            <Button onClick={handleSeeProfile}>{t('seeProfile')}</Button>

            <Button variant="outline" onClick={handleMyRequests}>
              {t('myRequests')}
            </Button>

            <Button onClick={handleLogout} variant="destructive">
              {t('logout')}
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
              {t('signIn')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMode('SignUp');
              }}
            >
              {t('signUp')}
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
