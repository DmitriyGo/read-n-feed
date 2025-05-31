import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('i18nextLng') ?? undefined,
    supportedLngs: ['en', 'ua'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18next.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18next;
