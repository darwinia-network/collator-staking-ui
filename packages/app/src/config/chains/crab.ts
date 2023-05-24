import { ChainConfig, ChainID } from "../../types";
import stakingABI from "../abi/stake.json";
import depositABI from "../abi/deposit.json";

export const crab: ChainConfig = {
  name: "Crab",
  displayName: "Crab",
  explorer: {
    name: "Subscan",
    url: "https://crab.subscan.io/",
  },
  rpc: "https://crab-rpc.darwinia.network/",
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
    staking: "0x0000000000000000000000000000000000000601",
    deposit: "0x0000000000000000000000000000000000000600",
  },
  contractInterface: {
    staking: stakingABI,
    deposit: depositABI,
  },
  chainId: ChainID.CRAB,
  substrate: {
    graphql: "https://subql.darwinia.network/subql-apps-crab/",
    rpc: {
      wss: "wss://crab-rpc.darwinia.network",
      https: "https://crab-rpc.darwinia.network",
    },
  },
  secondsPerBlock: 12,
};
