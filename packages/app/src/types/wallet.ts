export type WalletID = "metamask" | "wallet-connect";

export interface WalletCofig {
  id: WalletID;
  logo: string;
  name: string;
  disable?: boolean;
}

export interface Account {
  address: string;
  source: "wallet" | "read-only";
}
