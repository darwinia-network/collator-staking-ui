import { ChainConfig, SupportedWallet } from "./wallet";

export interface Account {
  id: number;
}

export interface Storage {
  isConnectedToWallet?: boolean;
  selectedNetwork?: ChainConfig;
  selectedWallet?: SupportedWallet;
  wasIntroShown?: boolean;
}

export interface ErrorEntity {
  code: number;
  message: string;
}

export interface MetaMaskError {
  code: number;
  data: ErrorEntity;
}
