"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import {
  safeWallet,
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
  talismanWallet,
  okxWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, WagmiProvider } from "wagmi";

import { APP_NAME_CONF } from "@/config";
import { getChainConfigs } from "@/utils";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, createClient, http } from "viem";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";
const queryClient = new QueryClient();
const connectors = connectorsForWallets(
  [
    {
      groupName: "More",
      wallets: [rainbowWallet, metaMaskWallet, walletConnectWallet, talismanWallet, okxWallet, safeWallet],
    },
  ],
  { appName: APP_NAME_CONF, projectId }
);

const chains = getChainConfigs().map(({ chainId, name, nativeToken, explorer, rpcMetas }) => ({
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
})) as unknown as [Chain, ...Chain[]];

export function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <WagmiProvider
      config={createConfig({
        connectors,
        chains,
        client: ({ chain }) => createClient({ chain, transport: http() }),
      })}
    >
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({ borderRadius: "none", accentColor: "#FF0083" })}
          appInfo={{ appName: APP_NAME_CONF }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
