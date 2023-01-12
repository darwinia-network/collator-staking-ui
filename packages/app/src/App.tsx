import Root from "./Root";
import { WalletProvider, StorageProvider, GraphQLProvider, DispatchProvider } from "@darwinia/app-providers";
import { i18nTranslationInit } from "@darwinia/app-locale";
import "intro.js/introjs.css";

i18nTranslationInit();

const App = () => {
  return (
    <WalletProvider>
      <GraphQLProvider>
        <StorageProvider>
          <DispatchProvider>
            <Root />
          </DispatchProvider>
        </StorageProvider>
      </GraphQLProvider>
    </WalletProvider>
  );
};

export default App;
