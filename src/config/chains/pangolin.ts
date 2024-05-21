import { ChainConfig, ChainID } from "@/types";

export const pangolinChainConfig: ChainConfig = {
  name: "Pangolin",
  chainId: ChainID.PANGOLIN,
  explorer: {
    name: "Subscan",
    url: "https://pangolin.subscan.io/",
  },
  rpcMetas: [
    {
      name: "Pangolin",
      url: "https://pangolin-rpc.darwinia.network",
    },
  ],
  nativeToken: {
    symbol: "PRING",
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
  secondsPerBlock: 12,
  substrate: {
    graphql: { endpoint: "https://subql.darwinia.network/subql-apps-pangolin/" },
    rpc: {
      wss: "wss://pangolin-rpc.darwinia.network",
      https: "https://pangolin-rpc.darwinia.network",
    },
  },
  logo: "pangolin.png",
};
