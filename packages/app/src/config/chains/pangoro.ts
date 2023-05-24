import { ChainConfig, ChainID } from "../../types";
import stakingABI from "../abi/stake.json";
import depositABI from "../abi/deposit.json";

export const pangoro: ChainConfig = {
  name: "Pangoro",
  displayName: "Pangoro",
  explorer: {
    name: "Subscan",
    url: "https://pangoro.subscan.io/",
  },
  rpc: "https://pangoro-rpc.darwinia.network/",
  kton: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "OKTON",
    decimals: 18,
  },
  ring: {
    name: "ORING",
    symbol: "ORING",
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
  chainId: ChainID.PANGORO,
  substrate: {
    graphql: "https://subql.darwinia.network/subql-apps-pangoro",
    rpc: {
      wss: "wss://pangoro-rpc.darwinia.network",
      https: "https://pangoro-rpc.darwinia.network",
    },
  },
  secondsPerBlock: 12,
  isTestNet: true,
  disable: true,
};
