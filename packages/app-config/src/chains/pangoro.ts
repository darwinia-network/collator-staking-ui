import { ChainConfig } from "@darwinia/app-types";
import stakingABI from "../abi/testNet/stake.json";
import depositABI from "../abi/testNet/deposit.json";
// import myTest from "../abi/testNet/myTest.json";

export const pangoro: ChainConfig = {
  name: "Pangoro",
  displayName: "Pangoro",
  explorerURLs: ["https://pangoro.subscan.io/"],
  httpsURLs: ["https://pangoro-rpc.darwinia.network"],
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
  chainId: 45,
  substrate: {
    graphQlURL: "https://subql.darwinia.network/subql-apps-pangoro",
    wssURL: "wss://pangoro-rpc.darwinia.network",
    httpsURL: "https://pangoro-rpc.darwinia.network", //useless for now
  },
  secondsPerBlock: 12,
};
