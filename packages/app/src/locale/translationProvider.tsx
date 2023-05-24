import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import enUS from "./translations/enUS";
import zhCN from "./translations/zhCN";

export const i18nTranslationInit = () => {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        enUS: {
          translation: enUS,
        },
        zhCN: {
          translation: zhCN,
        },
      },
      fallbackLng: "enUS",
    })
    .then(() => {
      // ignore
    })
    .catch(() => {
      // ignore
    });
};

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  return {
    t,
    i18n,
  };
};
