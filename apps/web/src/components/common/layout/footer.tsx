import { useTranslation } from 'react-i18next';

import { env } from '@/env';

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="flex flex-row justify-evenly pt-4">
      <p>{t('allRightsReserved')}</p>
      <p>
        {t('contactAdminPrompt')}
        {env.VITE_ADMIN_EMAIL}
      </p>
    </footer>
  );
};
