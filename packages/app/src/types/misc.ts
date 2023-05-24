import { Provider } from "@ethersproject/providers";
import { StakeAndNominateParams } from "./staking";

export interface Storage {
  wasIntroShown?: boolean;
}

interface ErrorEntity {
  code: number;
  message: string;
}

export interface MetaMaskError {
  code: number;
  data: ErrorEntity;
}

export interface DispatchCtx {
  setCollatorSessionKey: (sessionKey: string, provider: Provider | undefined) => Promise<boolean>;
  stakeAndNominate: (params: StakeAndNominateParams) => Promise<boolean>;
}
