import { ChainConfig, ChainID } from "../../types";
import stakingABI from "../abi/stake.json";
import depositABI from "../abi/deposit.json";

export const darwinia: ChainConfig = {
  name: "Darwinia",
  displayName: "Darwinia",
  explorer: {
    name: "Subscan",
    url: "https://darwinia.subscan.io/",
  },
  rpc: "https://rpc.darwinia.network/",
  kton: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "KTON",
    decimals: 18,
  },
  ring: {
    name: "RING",
    symbol: "RING",
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
  chainId: ChainID.DARWINIA,
  substrate: {
    graphql: "https://subql.darwinia.network/subql-apps-darwinia/",
    rpc: {
      wss: "wss://rpc.darwinia.network",
      https: "https://rpc.darwinia.network",
    },
  },
  secondsPerBlock: 12,
};
