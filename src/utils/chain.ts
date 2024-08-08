import { darwiniaChainConfig, crabChainConfig, koiChainConfig } from "@/config";
import { ChainConfig, ChainID } from "@/types";

export function getChainConfigs() {
  return [darwiniaChainConfig, crabChainConfig, koiChainConfig];
}

export function getChainConfig(chainId: ChainID) {
  const chains: Record<ChainID, ChainConfig> = {
    [ChainID.DARWINIA]: darwiniaChainConfig,
    [ChainID.CRAB]: crabChainConfig,
    [ChainID.KOI]: koiChainConfig,
  };
  return chains[chainId];
}
