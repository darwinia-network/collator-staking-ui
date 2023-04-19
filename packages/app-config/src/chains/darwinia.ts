import { ChainConfig } from "@darwinia/app-types";
import stakingABI from "../abi/testNet/stake.json";
import depositABI from "../abi/testNet/deposit.json";

export const darwinia: ChainConfig = {
  name: "Darwinia",
  displayName: "Darwinia",
  explorerURLs: ["https://darwinia.subscan.io/"],
  httpsURLs: ["https://cors.kahub.in/http://g1.dev.darwinia.network:10000"],
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
    staking: "0xcA927Df15afb7629b79dA4713a871190315c7409",
    deposit: "0xcA927Df15afb7629b79dA4713a871190315c7409",
  },
  contractInterface: {
    staking: stakingABI,
    deposit: depositABI,
  },
  chainId: 46,
  substrate: {
    graphQlURL: "https://api.subquery.network/sq/isunaslabs/darwinia2",
    wssURL: "ws://g1.dev.darwinia.network:20000",
    httpsURL: "https://cors.kahub.in/http://g1.dev.darwinia.network:10000",
  },
  secondsPerBlock: 12,
};

/*
 * DevNet
 * httpsURLs: ["https://cors.kahub.in/http://g1.dev.darwinia.network:10000"]
 *
 * LiveNet
 * httpURLs: ["https://rpc.darwinia.network"]
 * wssURL: "wss://rpc.darwinia.network",
 * graphQlURL: "https://subql.darwinia.network/subql-apps-darwinia/",
 *
 * */
