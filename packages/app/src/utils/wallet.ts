import { wallets } from "../config";
import { providers } from "ethers";
import { WalletClient } from "@wagmi/core";

export const getWallets = () => wallets.filter(({ disable }) => !disable);

export const isEthersApi = (api: unknown): api is providers.Web3Provider => {
  return (
    api instanceof providers.BaseProvider ||
    api instanceof providers.Web3Provider ||
    api instanceof providers.JsonRpcProvider ||
    api instanceof providers.WebSocketProvider
  );
};

export const isWalletClient = (api?: unknown): api is WalletClient => {
  if (api && typeof api === "object" && Object.hasOwn(api, "type")) {
    const { type } = api as { type?: unknown };
    return type === "walletClient";
  }
  return false;
};
