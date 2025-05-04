import { useTranslation } from 'react-i18next';

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('hello')}</p>
      <p>{t('welcome')}</p>
    </div>
  );
};
