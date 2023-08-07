"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
  imTokenWallet,
  okxWallet,
  safeWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import { APP_NAME_CONF } from "@/config";
import { getChainConfigs } from "@/utils";
import { PropsWithChildren, useEffect, useState } from "react";
import { useApp } from "@/hooks";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "";

export function RainbowProvider({ children }: PropsWithChildren<unknown>) {
  const [mounted, setMounted] = useState(true); // temporarity set to true
  const { activeChain, activeRpc } = useApp();

  const { chains, publicClient } = configureChains(
    getChainConfigs().map(({ chainId, name, nativeToken, explorer }) => ({
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
          http: activeRpc.url.startsWith("http") ? [activeRpc.url] : [],
          webSocket: activeRpc.url.startsWith("ws") ? [activeRpc.url] : [],
        },
        public: {
          http: activeRpc.url.startsWith("http") ? [activeRpc.url] : [],
          webSocket: activeRpc.url.startsWith("ws") ? [activeRpc.url] : [],
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
        imTokenWallet({ projectId, chains }),
        trustWallet({ projectId, chains }),
        safeWallet({ chains }),
        argentWallet({ projectId, chains }),
        ledgerWallet({ projectId, chains }),
      ],
    },
  ]);

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={{ appName: APP_NAME_CONF }} initialChain={activeChain}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
