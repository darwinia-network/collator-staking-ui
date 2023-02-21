import { ChainConfig } from "@darwinia/app-types";
import stakingABI from "../abi/testNet/stake.json";
import depositABI from "../abi/testNet/deposit.json";
// import myTest from "../abi/testNet/myTest.json";

export const pangolin: ChainConfig = {
  name: "Pangolin",
  displayName: "Pangolin",
  explorerURLs: ["https://pangolin.subscan.io/"],
  httpsURLs: ["https://pangolin-rpc.darwinia.network"],
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
  chainId: 43,
  substrate: {
    graphQlURL: "https://api.subquery.network/sq/isunaslabs/pangolin2",
    wssURL: "wss://pangolin-rpc.darwinia.network/",
    httpsURL: "https://pangolin-rpc.darwinia.network", //useless for now
  },
  secondsPerBlock: 12,
};
