import { darwinia, crab, pangolin, pangoro } from "../config/chains";
import { ChainID } from "../types";

export const getChainsConfig = () => [darwinia, crab, pangolin, pangoro].filter((chain) => !chain.disable);

export const getChainConfig = (chainId: ChainID) => getChainsConfig().find((chain) => chain.chainId === chainId);
