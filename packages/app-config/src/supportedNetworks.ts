import { ChainConfig } from "@darwinia/app-types";
import { crab } from "./chains/crab";
import { darwinia } from "./chains/darwinia";
import { testNet } from "./chains/testNet";
import { pangoro } from "./chains/pangoro";

export const supportedNetworks: ChainConfig[] = [darwinia, crab, testNet, pangoro];
