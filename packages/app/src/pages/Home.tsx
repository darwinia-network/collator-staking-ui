import { Spinner } from "@darwinia/ui";
import { useAppTranslation, localeKeys } from "../locale";
import { useWallet } from "../hooks";
import { getWallets } from "../utils";

const Home = () => {
  const { t } = useAppTranslation();
  const { isConnecting, connect, isInstalled } = useWallet();

  return (
    <div className={"flex flex-1 justify-center items-center bg-blackSecondary"}>
      <div className={"flex flex-col items-center gap-[1.875rem] max-w-[550px]"}>
        <div className="flex items-center justify-center gap-12">
          {getWallets().map(({ id, logo, name }) => {
            return (
              <Spinner isLoading={isConnecting[id]} size="small" key={id}>
                <button
                  className={`flex flex-col items-center justify-center gap-5 w-48 h-48 rounded-sm ${
                    isInstalled(id)
                      ? "border border-black bg-black transition hover:border-primary active:opacity-80"
                      : "cursor-not-allowed bg-gray/20 opacity-80"
                  }`}
                  onClick={() => connect(id)}
                >
                  <img alt="..." src={logo} />
                  <span className="text-center">{name}</span>
                </button>
              </Spinner>
            );
          })}
        </div>
        <div className="text-center text-gray">{t(localeKeys.connectWalletInfo)}</div>
      </div>
    </div>
  );
};

export default Home;
