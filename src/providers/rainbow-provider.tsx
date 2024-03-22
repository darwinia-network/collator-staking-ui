"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { okxWallet, talismanWallet, safeWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import { APP_NAME_CONF } from "@/config";
import { getChainConfigs } from "@/utils";
import { PropsWithChildren } from "react";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const { chains, publicClient } = configureChains(
  getChainConfigs().map(({ chainId, name, nativeToken, explorer, rpcMetas }) => ({
    id: chainId,
    name,
    network: name.toLowerCase().split(" ").join("-"),
    nativeCurrency: {
      name: nativeToken.symbol,
      symbol: nativeToken.symbol,
      decimals: nativeToken.decimals,
    },
    rpcUrls: {
      default: {
        http: rpcMetas.filter(({ url }) => url.startsWith("http")).map(({ url }) => url),
        webSocket: rpcMetas.filter(({ url }) => url.startsWith("ws")).map(({ url }) => url),
      },
      public: {
        http: rpcMetas.filter(({ url }) => url.startsWith("http")).map(({ url }) => url),
        webSocket: rpcMetas.filter(({ url }) => url.startsWith("ws")).map(({ url }) => url),
      },
    },
    blockExplorers: {
      default: {
        url: explorer.url,
        name: explorer.name,
      },
    },
  })),
  [publicProvider()]
);

export function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  const { wallets } = getDefaultWallets({
    appName: APP_NAME_CONF,
    projectId,
    chains,
  });

  const connectors = connectorsForWallets([
    ...wallets,
    {
      groupName: "More",
      wallets: [
        okxWallet({ projectId, chains }),
        rabbyWallet({ chains }),
        talismanWallet({ chains }),
        safeWallet({ chains }),
      ],
    },
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        theme={darkTheme({ borderRadius: "none", accentColor: "#FF0083" })}
        chains={chains}
        appInfo={{ appName: APP_NAME_CONF }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
