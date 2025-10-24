
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'de', 'fr', 'es', 'it', 'ru', 'pt', 'tr', 'zh', 'ko', 'ja', 'vi', 'id', 'hi', 'ar'],
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    debug: true,
    detection: {
      order: ['querystring', 'navigator', 'cookie', 'localStorage', 'sessionStorage', 'htmlTag'],
      caches: ['cookie'],
      load: 'languageOnly', // Add this to strip region codes like -GB
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
