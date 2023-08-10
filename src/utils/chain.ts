import { darwiniaChainConfig, crabChainConfig } from "@/config";
import { ChainConfig, ChainID } from "@/types";

export function getChainConfigs() {
  return [darwiniaChainConfig, crabChainConfig];
}

export function getChainConfig(chainId: ChainID) {
  const chains: Record<ChainID, ChainConfig> = {
    [ChainID.DARWINIA]: darwiniaChainConfig,
    [ChainID.CRAB]: crabChainConfig,
  };
  return chains[chainId];
}
