import metaMaskLogo from "./assets/images/metamask-logo.svg";
import { WalletConfig } from "@darwinia/app-types";

export const dAppSupportedWallets: WalletConfig[] = [
  {
    name: "MetaMask",
    logo: metaMaskLogo,
    extensions: [
      {
        browser: "Chrome",
        downloadURL: "https://metamask.io/",
      },
      {
        browser: "Firefox",
        downloadURL: "https://metamask.io/",
      },
      {
        browser: "Brave",
        downloadURL: "https://metamask.io/",
      },
      {
        browser: "Edge",
        downloadURL: "https://metamask.io/",
      },
      {
        browser: "Opera",
        downloadURL: "https://metamask.io/",
      },
    ],
  },
];
