import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ChangeLanguage } from './language';
import { Profile } from './profile';

import { Route } from '@/constants';
import { useHasRole } from '@/hooks';

export const Header = () => {
  const { hasRole: isAdmin } = useHasRole('ADMIN');
  const { t } = useTranslation();

  return (
    <nav className="w-full flex flex-row items-center border-b-2 border-border bg-card py-3 px-12 mb-4">
      <ul className="flex w-full justify-evenly flex-row gap-4">
        <li>
          <Link to={Route.Home}>{t('home')}</Link>
        </li>
        <li>
          <Link to={Route.Book.Search}>{t('catalogue')}</Link>
        </li>

        {isAdmin && (
          <li>
            <Link to={Route.Admin.BookRequests}>{t('userRequests')}</Link>
          </li>
        )}
      </ul>

      <ChangeLanguage />

      <Profile />
    </nav>
  );
};
