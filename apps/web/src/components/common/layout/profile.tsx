import { isDefined } from '@read-n-feed/shared';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

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
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const navigate = useNavigate();

  const { setMode } = useModalStore();

  const { accessToken } = useAuth();
  const { mutateAsync: logout } = useLogout();

  const { data } = useGetProfile();

  const handleLogout = () => {
    logout();
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar src={data?.data.avatarUrl} />
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-4" align="end">
        {isDefined(accessToken) ? (
          <>
            <Link to={Route.Profile}>
              <Button className="w-full">{t('seeProfile')}</Button>
            </Link>
            <Link to={Route.Requests.MyBookRequests}>
              <Button className="w-full" variant="outline">
                {t('myRequests')}
              </Button>
            </Link>

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
