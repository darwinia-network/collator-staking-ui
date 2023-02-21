export interface Ethereum {
  isEthereum: boolean;
  request: <T>(requestParams: { method: string; params?: unknown }) => Promise<T>;
  on: <T = unknown>(event: string, callback: (data: T) => void) => void;
  removeListener: <T = unknown>(event: string, callback: (data: T) => void) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export declare global {
  interface Window {
    ethereum: Ethereum;
  }
}
