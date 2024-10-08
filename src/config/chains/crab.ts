import { ChainConfig, ChainID } from "@/types";

export const crabChainConfig: ChainConfig = {
  name: "Crab",
  chainId: ChainID.CRAB,
  explorer: {
    name: "Subscan",
    url: "https://crab-scan.darwinia.network/",
  },
  rpcMetas: [
    {
      name: "Crab",
      url: "https://crab-rpc.darwinia.network",
    },
    {
      name: "DCDAO",
      url: "https://crab-rpc.dcdao.box",
    }
  ],
  nativeToken: {
    symbol: "CRAB",
    decimals: 18,
    logoPath: "/images/token/crab.svg",
  },
  ktonToken: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "CKTON",
    decimals: 18,
    logoPath: "/images/token/ckton.svg",
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
    graphql: { endpoint: "https://subql.darwinia.network/subql-apps-crab/" },
    rpc: {
      wss: "wss://crab-rpc.darwinia.network",
      https: "https://crab-rpc.darwinia.network",
    },
  },
  logo: "crab.png",
};
