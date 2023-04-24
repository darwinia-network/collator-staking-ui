import { ChainConfig } from "@darwinia/app-types";
import stakingABI from "../abi/testNet/stake.json";
import depositABI from "../abi/testNet/deposit.json";

export const darwinia: ChainConfig = {
  name: "Darwinia",
  displayName: "Darwinia",
  explorerURLs: ["https://darwinia.subscan.io/"],
  httpsURLs: ["https://rpc.darwinia.network"],
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
  chainId: 46,
  substrate: {
    graphQlURL: "https://subql.darwinia.network/subql-apps-darwinia/",
    wssURL: "wss://rpc.darwinia.network",
    httpsURL: "https://rpc.darwinia.network",
  },
  secondsPerBlock: 12,
};

/*
 * DevNet
 * httpsURLs: ["https://cors.zimjs.com/http://g1.dev.darwinia.network:10000"]
 * graphQlURL: "https://api.subquery.network/sq/isunaslabs/darwinia2",
 * wssURL: "ws://g1.dev.darwinia.network:20000",
 *
 * LiveNet
 * httpURLs: ["https://rpc.darwinia.network"]
 * wssURL: "wss://rpc.darwinia.network",
 * graphQlURL: "https://subql.darwinia.network/subql-apps-darwinia/",
 *
 * */
