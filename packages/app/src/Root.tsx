import App from "./App";
import { WalletProvider, StakingProvider, GraphQLProvider } from "./providers";
import { getChainsConfig } from "./utils";
import { i18nTranslationInit } from "./locale";
import "intro.js/introjs.css";

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import type { Chain } from "wagmi";

const chains = getChainsConfig().map(({ chainId, name, displayName, ring, rpc, explorer }) => ({
  id: chainId,
  name: displayName,
  network: name.toLowerCase().split(" ").join("-"),
  nativeCurrency: {
    name: ring.name,
    symbol: ring.symbol,
    decimals: ring.decimals,
  },
  rpcUrls: {
    default: {
      http: rpc.startsWith("http") ? [rpc] : [],
      webSocket: rpc.startsWith("ws") ? [rpc] : [],
    },
    public: {
      http: rpc.startsWith("http") ? [rpc] : [],
      webSocket: rpc.startsWith("ws") ? [rpc] : [],
    },
  },
  blockExplorers: {
    default: {
      url: explorer.url,
      name: explorer.name,
    },
  },
})) as Chain[];
const projectId = "12c48c2a9521b1447d902c9e06ddfe79";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

i18nTranslationInit();

export default function Root() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <WalletProvider>
          <GraphQLProvider>
            <StakingProvider>
              <App />
            </StakingProvider>
          </GraphQLProvider>
        </WalletProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
