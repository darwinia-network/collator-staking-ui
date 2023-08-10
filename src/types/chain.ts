export enum ChainID {
  // PANGOLIN = 43,
  CRAB = 44,
  // PANGORO = 45,
  DARWINIA = 46,
}

export interface RpcMeta {
  name?: string;
  url: string;
}

interface NativeToken {
  symbol: string;
  decimals: number;
  logoPath: string;
}

interface KtonToken extends NativeToken {
  address: `0x${string}`;
}

interface Contract {
  abiFile: string;
  address: `0x${string}`;
}

interface Substrate {
  rpc: {
    wss: string;
    https: string;
  };
  graphql: {
    endpoint: string;
  };
}

export interface ChainConfig {
  name: string;
  chainId: ChainID;
  nativeToken: NativeToken;
  ktonToken?: KtonToken;
  rpcMetas: RpcMeta[];
  explorer: {
    name: string;
    url: string;
  };
  contract: {
    deposit: Contract;
    staking: Contract;
  };
  secondsPerBlock: number;
  substrate: Substrate;
  isTestNet?: boolean;
}
