import { ChainConfig, ChainID } from "@/types";

export const koiChainConfig: ChainConfig = {
  name: "Koi",
  chainId: ChainID.KOI,
  explorer: {
    name: "Koiscan",
    url: "https://koi-scan.darwinia.network",
  },
  rpcMetas: [
    {
      name: "Koi",
      url: "https://koi-rpc.darwinia.network",
    },
  ],
  nativeToken: {
    symbol: "KRING",
    decimals: 18,
    logoPath: "/images/token/ring.svg",
  },
  ktonToken: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "PKTON",
    decimals: 18,
    logoPath: "/images/token/kton.svg",
  },
  contract: {
    deposit: {
      address: "0x0000000000000000000000000000000000000600",
      abiFile: "deposit.json",
    },
    staking: {
      address: "0x0000000000000000000000000000000000000601",
      abiFile: "staking.json",
    },
  },
  secondsPerBlock: 6,
  substrate: {
    graphql: { endpoint: "https://subql.darwinia.network/subql-apps-pangolin/" }, // Fake
    rpc: {
      wss: "wss://koi-scan.darwinia.network",
      https: "https://koi-scan.darwinia.network",
    },
  },
  logo: "koi.png",
};
