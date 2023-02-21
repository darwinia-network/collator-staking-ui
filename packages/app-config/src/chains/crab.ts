import { ChainConfig } from "@darwinia/app-types";
import stakingABI from "../abi/testNet/stake.json";
import depositABI from "../abi/testNet/deposit.json";

export const crab: ChainConfig = {
  name: "Crab",
  displayName: "Crab",
  explorerURLs: ["https://crab.subscan.io/"],
  httpsURLs: ["https://crab-rpc.darwinia.network"],
  kton: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "CKTON",
    decimals: 18,
  },
  ring: {
    name: "CRAB",
    symbol: "CRAB",
    decimals: 18,
  },
  contractAddresses: {
    staking: "0xcA927Df15afb7629b79dA4713a871190315c7409",
    deposit: "0xcA927Df15afb7629b79dA4713a871190315c7409",
  },
  contractInterface: {
    staking: stakingABI,
    deposit: depositABI,
  },
  chainId: 44,
  substrate: {
    graphQlURL: "https://subql.darwinia.network/subql-apps-crab/",
    wssURL: "wss://crab-rpc.darwinia.network",
    httpsURL: "https://crab-rpc.darwinia.network",
  },
  secondsPerBlock: 12,
};
