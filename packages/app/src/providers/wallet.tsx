import { createContext, PropsWithChildren, useCallback, useEffect, useState } from "react";
import type { WalletClient } from "@wagmi/core";
import {
  getWalletClient,
  watchWalletClient,
  watchAccount,
  disconnect as disconnectWalletConnect,
  switchNetwork,
} from "@wagmi/core";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useConnect } from "wagmi";
import { utils, providers } from "ethers";
import { getChainConfig, getChainsConfig, getStore, isEthersApi, isWalletClient, setStore } from "../utils";
import { Account, ChainID, WalletID, RpcMeta } from "../types";
import { BaseProvider } from "@ethersproject/providers";
import { Subscription, from } from "rxjs";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { useApp } from "../hooks";

interface WalletCtx {
  providerApi: BaseProvider | null | undefined;
  signerApi: WalletClient | BaseProvider | null | undefined;
  activeAccount: Account | null | undefined;
  currentChain: ChainID | undefined;
  isConnecting: { [key in WalletID]: boolean };
  isNetworkMismatch: boolean;
  activeRpc: RpcMeta;
  connect: (walletId: WalletID) => Promise<void>;
  disconnect: () => void;
  setCurrentChain: (chainId: number) => void;
  isInstalled: (walletId: WalletID) => boolean;
  setActiveRpc: (value: RpcMeta) => void;
  switchNetwork: () => void;
}

const defaultValue: WalletCtx = {
  providerApi: undefined,
  signerApi: undefined,
  activeAccount: undefined,
  currentChain: undefined,
  isConnecting: { metamask: false, "wallet-connect": false },
  isNetworkMismatch: false,
  activeRpc: { url: "" },
  connect: async () => undefined,
  disconnect: () => undefined,
  setCurrentChain: () => undefined,
  isInstalled: () => false,
  setActiveRpc: () => undefined,
  switchNetwork: () => undefined,
};

export const WalletContext = createContext<WalletCtx>(defaultValue);

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [providerApi, setProviderApi] = useState<WalletCtx["providerApi"]>();
  const [signerApi, setSignerApi] = useState<WalletCtx["signerApi"]>();
  const [activeAccount, setActiveAccount] = useState<WalletCtx["activeAccount"]>();
  const [currentChain, _setCurrentChain] = useState<WalletCtx["currentChain"]>();
  const [isConnecting, setIsConnecting] = useState<WalletCtx["isConnecting"]>({
    metamask: false,
    "wallet-connect": false,
  });
  const [isNetworkMismatch, setIsNetworkMismatch] = useState<WalletCtx["isNetworkMismatch"]>(false);
  const [activeRpc, _setActiveRpc] = useState<WalletCtx["activeRpc"]>({ url: "" });

  const location = useLocation();
  const navigate = useNavigate();
  const [connectedWallet, setConnectedWallet] = useState<WalletID | null>();
  const { setIsWrongChainPromptOpen } = useApp();

  const { open, setDefaultChain } = useWeb3Modal();
  const { connectors } = useConnect();
  useAccount({
    onConnect({ address }) {
      setConnectedWallet("wallet-connect");
      if (address) {
        setActiveAccount({ address, source: "wallet" });
      } else {
        setActiveAccount(null);
      }
    },
    onDisconnect() {
      setConnectedWallet(null);
      setActiveAccount(null);
      setSignerApi(null);
    },
  });

  const connect = useCallback(
    async (walletId: WalletID) => {
      let address: string | null | undefined = null;

      if (walletId === "metamask") {
        setIsConnecting((prev) => ({ ...prev, [walletId]: true }));

        const provider = new providers.Web3Provider(window.ethereum);
        setSignerApi(provider);
        try {
          address = ((await provider.send("eth_requestAccounts", [])) as string[]).at(0);
          if (address) {
            setActiveAccount({ address, source: "wallet" });
          } else {
            setActiveAccount(null);
          }
          setConnectedWallet(walletId);
        } catch (error) {
          console.error(error);
        }

        setIsConnecting((prev) => ({ ...prev, [walletId]: false }));
      } else if (walletId === "wallet-connect") {
        setIsConnecting((prev) => ({ ...prev, [walletId]: true }));
        try {
          await open();
        } catch (error) {
          console.error(error);
        }
        setIsConnecting((prev) => ({ ...prev, [walletId]: false }));
      }
    },
    [open]
  );

  const disconnect = useCallback(() => {
    setConnectedWallet((prev) => {
      if (prev === "metamask") {
        setActiveAccount(null);
        setSignerApi(null);

        return null;
      } else if (prev === "wallet-connect") {
        disconnectWalletConnect();
        return prev; // we will reset in onDisconnect of useAccount
      }
      return prev;
    });
  }, []);

  const walletSwitchNetwork = useCallback(async () => {
    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      if (chainConfig && isEthersApi(signerApi)) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: utils.hexlify(chainConfig.chainId) }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if ((switchError as { code: number }).code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: utils.hexlify(chainConfig.chainId),
                    chainName: chainConfig.displayName,
                    rpcUrls: [activeRpc.url],
                    blockExplorerUrls: [chainConfig.explorer.url],
                    nativeCurrency: chainConfig.ring,
                  },
                ],
              });
            } catch (addError) {
              // handle "add" error
            }
          }
          // handle other "switch" errors
        }
      } else if (chainConfig && isWalletClient(signerApi)) {
        switchNetwork({ chainId: chainConfig.chainId });
      }
    }
  }, [currentChain, signerApi, activeRpc.url]);

  const isInstalled = useCallback((walletId: WalletID) => {
    if (walletId === "metamask") {
      return typeof window.ethereum !== "undefined";
    } else if (walletId === "wallet-connect") {
      return true;
    }
    return false;
  }, []);

  const setActiveRpc = useCallback(
    (rpcMeta: RpcMeta) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("rpc", encodeURIComponent(rpcMeta.url));
      navigate(`${location.pathname}?${searchParams.toString()}`);
      _setActiveRpc(rpcMeta);
    },
    [location, navigate]
  );

  // update state, save store, update url search params
  const setCurrentChain = useCallback(
    (chainId: ChainID) => {
      const config = getChainConfig(chainId);
      _setCurrentChain(config?.chainId);
      _setActiveRpc(config?.rpcMetas[0] ?? { url: "" });
      setStore("network", config?.name);

      const searchParams = new URLSearchParams(location.search);
      if (config) {
        searchParams.set("network", config.name);
        searchParams.set("rpc", config.rpcMetas[0].url);
      } else {
        searchParams.delete("network");
      }

      if (searchParams.toString().length) {
        navigate(`${location.pathname}?${searchParams.toString()}`);
      } else {
        navigate(location.pathname);
      }
    },
    [location, navigate]
  );

  // setDefaultChain for WalletConnect
  useEffect(() => {
    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      if (chainConfig) {
        setDefaultChain(connectors[0].chains.find(({ id }) => id === chainConfig.chainId));
      }
    }
  }, [currentChain, connectors, setDefaultChain]);

  // update providerApi
  useEffect(() => {
    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      if (chainConfig) {
        if (activeRpc.url.startsWith("ws")) {
          setProviderApi(new providers.WebSocketProvider(activeRpc.url));
        } else if (activeRpc.url.startsWith("http")) {
          setProviderApi(new providers.JsonRpcProvider(activeRpc.url));
        }
      }
    }
    return () => {
      setProviderApi(null);
    };
  }, [currentChain, activeRpc.url]);

  // init currentChain & activeAccount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.href.split("?").at(1));

    const chainName = searchParams.get("network") || getStore("network") || getChainsConfig().at(0)?.name;
    const chainConfig = getChainsConfig().find(({ name }) => name.toLowerCase() === chainName?.toLowerCase());
    _setCurrentChain((prev) => chainConfig?.chainId ?? prev);
    setStore("network", chainConfig?.name);

    const rpc = searchParams.get("rpc");
    if (rpc) {
      _setActiveRpc({ url: decodeURIComponent(rpc) });
    } else {
      _setActiveRpc(chainConfig?.rpcMetas[0] || { url: "" });
    }

    const address = searchParams.get("account");
    if (utils.isAddress(address || "")) {
      // setActiveAccount(address ? { address, source: "read-only" } : null);
    }
  }, []);

  // update signerApi & activeAccount
  useEffect(() => {
    let sub$$: Subscription | undefined = undefined;
    let unwatchWallet: () => void = () => undefined;
    let unwatchAccount: () => void = () => undefined;

    if (connectedWallet === "metamask") {
      window.ethereum.on("chainChanged", () => {
        setSignerApi(new providers.Web3Provider(window.ethereum));
      });

      window.ethereum.on("accountsChanged", (accs: string[]) => {
        setActiveAccount(accs.length ? { address: accs[0], source: "wallet" } : null);
      });
    } else if (connectedWallet === "wallet-connect") {
      sub$$ = from(getWalletClient()).subscribe({
        next: setSignerApi,
        error: console.error,
      });
      unwatchWallet = watchWalletClient({}, setSignerApi);
      unwatchAccount = watchAccount(({ address }) => setActiveAccount(address ? { address, source: "wallet" } : null));
    }

    return () => {
      sub$$?.unsubscribe();
      unwatchWallet();
      unwatchAccount();
    };
  }, [connectedWallet]);

  // update isNetworkMismatch
  useEffect(() => {
    let sub$$: Subscription | null = null;

    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      if (chainConfig) {
        if (isEthersApi(signerApi)) {
          sub$$ = from(signerApi.getNetwork()).subscribe(({ chainId }) => {
            setIsWrongChainPromptOpen(chainId !== chainConfig.chainId);
            setIsNetworkMismatch(chainId !== chainConfig.chainId);
          });
        } else if (isWalletClient(signerApi)) {
          sub$$ = from(signerApi.getChainId()).subscribe((chainId) => {
            setIsWrongChainPromptOpen(chainId !== chainConfig.chainId);
            setIsNetworkMismatch(chainId !== chainConfig.chainId);
          });
        }
      }
    }

    return () => {
      sub$$?.unsubscribe();
      setIsNetworkMismatch(false);
    };
  }, [currentChain, signerApi, setIsWrongChainPromptOpen]);

  // handle navigate after connect / disconnect
  useEffect(() => {
    const matchHome = matchPath("/", location.pathname);
    const matchStaking = matchPath("/staking", location.pathname);

    if (signerApi && activeAccount && !matchStaking) {
      navigate(`/staking${location.search}`);
    } else if (!signerApi && !activeAccount && !matchHome) {
      navigate(`/${location.search}`);
    }
  }, [signerApi, activeAccount, location.search, location.pathname, navigate]);

  return (
    <WalletContext.Provider
      value={{
        providerApi,
        signerApi,
        activeAccount,
        currentChain,
        isConnecting,
        isNetworkMismatch,
        activeRpc,
        connect,
        disconnect,
        setCurrentChain,
        isInstalled,
        setActiveRpc,
        switchNetwork: walletSwitchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
