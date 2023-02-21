import metamaskLogo from "../assets/images/metamask-logo.svg";
import { Button } from "@darwinia/ui";
import { useAppTranslation, localeKeys } from "@darwinia/app-locale";
import { useWallet } from "@darwinia/app-providers";

const Home = () => {
  const { t } = useAppTranslation();
  const { connectWallet } = useWallet();

  return (
    <div className={"flex flex-1 justify-center items-center"}>
      <div className={"flex flex-col items-center gap-[20px] max-w-[550px]"}>
        <img className={"w-[96px]"} src={metamaskLogo} alt="image" />
        <Button
          onClick={() => {
            connectWallet();
          }}
        >
          {t(localeKeys.connectToMetamask)}
          <span>{" >"}</span>
        </Button>
        <div className={"text-center"}>{t(localeKeys.connectWalletInfo)}</div>
      </div>
    </div>
  );
};

export default Home;
