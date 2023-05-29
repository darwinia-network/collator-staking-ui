import { WalletCofig } from "../types";
import metamaskIcon from "../assets/images/wallet/metamask.svg";
import walletConnectIcon from "../assets/images/wallet/wallet-connect.svg";

export const wallets: WalletCofig[] = [
  {
    id: "metamask",
    name: "MetaMask",
    logo: metamaskIcon,
  },
  {
    id: "wallet-connect",
    name: "WalletConnect",
    logo: walletConnectIcon,
  },
];
