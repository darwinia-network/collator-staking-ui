import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import type { WalletClient } from "@wagmi/core";
import { getPublicClient, getWalletClient, watchPublicClient, watchWalletClient } from "@wagmi/core";
import { useWeb3Modal } from "@web3modal/react";
import { useConnect, useDisconnect } from "wagmi";
import { Subscription, from } from "rxjs";
import { utils } from "ethers";
import { getChainConfig, getChainsConfig } from "../utils";
import { ChainID, WalletID } from "../types";
import { BaseProvider } from "@ethersproject/providers";

interface WalletCtx {
  providerApi: BaseProvider | null | undefined;
  signerApi: WalletClient | BaseProvider | null | undefined;
  activeAccount: string | null | undefined;
  currentChain: ChainID | undefined;
  isConnecting: boolean;
  connect: (walletId: WalletID) => Promise<void>;
  disconnect: (walletId: WalletID) => void;
  setCurrentChain: (chainId: number) => void;
  isInstalled: (walletId: WalletID) => boolean;
  // setActiveAccount: (account: string | null | undefined) => void;
}

const defaultValue: WalletCtx = {
  providerApi: undefined,
  signerApi: undefined,
  activeAccount: undefined,
  currentChain: undefined,
  isConnecting: false,
  connect: async () => undefined,
  disconnect: () => undefined,
  setCurrentChain: () => undefined,
  isInstalled: () => false,
};

export const WalletContext = createContext<WalletCtx>(defaultValue);

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [providerApi, setProviderApi] = useState<WalletCtx["providerApi"]>();
  const [signerApi, setSignerApi] = useState<WalletCtx["signerApi"]>();
  const [activeAccount, setActiveAccount] = useState<WalletCtx["activeAccount"]>();
  const [currentChain, setCurrentChain] = useState<WalletCtx["currentChain"]>();
  const [isConnecting, setIsConnecting] = useState(false);

  const { open, setDefaultChain } = useWeb3Modal();
  const { connectors } = useConnect();
  const { disconnect: disconnectWallet } = useDisconnect();

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const connect = useCallback(async (walletId: WalletID) => {
    if (walletId === "metamask") {
      setIsConnecting(true);
    } else if (walletId === "wallet-connect") {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback((walletId: WalletID) => {
    //
  }, []);

  const isInstalled = useCallback((walletId: WalletID) => {
    if (walletId === "metamask") {
      return typeof window.ethereum !== "undefined";
    } else if (walletId === "wallet-connect") {
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      if (chainConfig) {
        setDefaultChain(connectors[0].chains.find(({ id }) => id === chainConfig.chainId));
      }
    }
  }, [currentChain, connectors, setDefaultChain]);

  // update providerApi & signerApi
  // useEffect(() => {
  //   let sub$$: Subscription | null = null;
  //   let unwatchWallet: () => void = () => undefined;

  //   return () => {
  //     sub$$?.unsubscribe();
  //     unwatchWallet();
  //   };
  // }, [currentChain]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const network = searchParams.get("network");
    const found = getChainsConfig().find(({ chainId }) => chainId.toString() === network);
    setCurrentChain((prev) => found?.chainId ?? prev);

    const account = searchParams.get("account");
    setActiveAccount((prev) => (utils.isAddress(account || "") ? account : prev));
  }, []);

  return (
    <WalletContext.Provider
      value={{
        providerApi,
        signerApi,
        activeAccount,
        currentChain,
        isConnecting,
        connect,
        disconnect,
        setCurrentChain,
        isInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
