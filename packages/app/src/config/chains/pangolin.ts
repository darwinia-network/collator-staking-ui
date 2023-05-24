import { ChainConfig, ChainID } from "../../types";
import stakingABI from "../abi/stake.json";
import depositABI from "../abi/deposit.json";

export const pangolin: ChainConfig = {
  name: "Pangolin",
  displayName: "Pangolin",
  explorer: {
    name: "Subscan",
    url: "https://pangolin.subscan.io/",
  },
  rpc: "https://pangolin-rpc.darwinia.network/",
  kton: {
    address: "0x0000000000000000000000000000000000000402",
    symbol: "PKTON",
    decimals: 18,
  },
  ring: {
    name: "PRING",
    symbol: "PRING",
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
  chainId: ChainID.PANGOLIN,
  substrate: {
    graphql: "https://subql.darwinia.network/subql-apps-pangolin",
    rpc: {
      wss: "wss://pangolin-rpc.darwinia.network/",
      https: "https://pangolin-rpc.darwinia.network",
    },
  },
  secondsPerBlock: 12,
  isTestNet: true,
  disable: true,
};
