import { ChainConfig, ChainID } from "@/types";

export const darwiniaChainConfig: ChainConfig = {
  name: "Darwinia",
  chainId: ChainID.DARWINIA,
  explorer: {
    name: "Subscan",
    url: "https://darwinia.subscan.io/",
  },
  rpcMetas: [
    {
      name: "Darwinia",
      url: "https://rpc.darwinia.network",
    },
    {
      name: "Darwinia Community",
      url: "https://darwinia-rpc.darwiniacommunitydao.xyz",
    },
    {
      name: "Dwellir",
      url: "https://darwinia-rpc.dwellir.com",
    },
  ],
  nativeToken: {
    symbol: "RING",
    decimals: 18,
    logoPath: "/images/token/ring.svg",
  },
  ktonToken: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "KTON",
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
    graphql: {
      endpoint: "https://subql.darwinia.network/subql-apps-darwinia/",
    },
    rpc: {
      wss: "wss://rpc.darwinia.network",
      https: "https://rpc.darwinia.network",
    },
  },
};
