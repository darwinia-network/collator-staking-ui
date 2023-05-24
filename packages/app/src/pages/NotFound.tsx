import ErrorCatcher from "./ErrorCatcher";
import { useAppTranslation, localeKeys } from "../locale";

const NotFound = () => {
  const { t } = useAppTranslation();
  return <ErrorCatcher title="404" message={t(localeKeys.pageNotFound)} />;
};

export default NotFound;
