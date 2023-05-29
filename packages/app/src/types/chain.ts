interface Substrate {
  rpc: {
    wss: string;
    https: string;
  };
  metadata?: string;
  graphql: string; // endpoint
}

interface Token {
  name?: string;
  address?: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

type ContractInterface = object[]; // for compatibility with WalletConnect

interface ContractABI {
  staking: ContractInterface;
  deposit: ContractInterface;
}

interface ContractAddress {
  staking: `0x${string}`;
  deposit: `0x${string}`;
}

export enum ChainID {
  PANGOLIN = 43,
  CRAB = 44,
  PANGORO = 45,
  DARWINIA = 46,
}

export interface ChainConfig {
  name: string; // this name is used to set the chain name in MetaMask, the user will later see this name on Metamask
  displayName: string; // This name is used on the dApp just for the user to see
  chainId: ChainID;
  ring: Token;
  kton: Token;
  rpc: string;
  explorer: {
    name: string;
    url: string;
  };
  contractInterface: ContractABI;
  contractAddresses: ContractAddress;
  substrate: Substrate;
  secondsPerBlock: number;
  isTestNet?: boolean;
  disable?: boolean;
}
