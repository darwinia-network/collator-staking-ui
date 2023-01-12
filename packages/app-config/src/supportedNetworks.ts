import { ChainConfig } from "@darwinia/app-types";
import { crab } from "./chains/crab";
import { darwinia } from "./chains/darwinia";
import { testNet } from "./chains/testNet";

export const supportedNetworks: ChainConfig[] = [darwinia, crab, testNet];
