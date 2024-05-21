import { darwiniaChainConfig, crabChainConfig, pangolinChainConfig } from "@/config";
import { ChainConfig, ChainID } from "@/types";

export function getChainConfigs() {
  return [darwiniaChainConfig, crabChainConfig, pangolinChainConfig];
}

export function getChainConfig(chainId: ChainID) {
  const chains: Record<ChainID, ChainConfig> = {
    [ChainID.DARWINIA]: darwiniaChainConfig,
    [ChainID.CRAB]: crabChainConfig,
    [ChainID.PANGOLIN]: pangolinChainConfig,
  };
  return chains[chainId];
}
