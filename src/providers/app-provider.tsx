"use client";

import { ChainID, UrlParamsKey, StoreKey, RpcMeta } from "@/types";
import { getChainConfig, getChainConfigs } from "@/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useEffect, useState } from "react";

const defaultChainConfig = getChainConfig(ChainID.DARWINIA);

const getInitChain = (urlChain: string | null) => {
  const chainConfigs = getChainConfigs();

  if (urlChain) {
    for (const chainConfig of chainConfigs) {
      if (urlChain === chainConfig.name) {
        return chainConfig;
      }
    }
  }

  const storeChainId = localStorage.getItem(StoreKey.ACTIVE_CHAIN);
  if (storeChainId) {
    for (const chainConfig of chainConfigs) {
      if (storeChainId === chainConfig.chainId.toString()) {
        return chainConfig;
      }
    }
  }

  return defaultChainConfig;
};

interface AppCtx {
  activeChain: ChainID;
  rpcMetas: RpcMeta[];
  activeRpc: RpcMeta;
  setActiveChain: (chainId: ChainID) => void;
  setRpcMetas: Dispatch<SetStateAction<RpcMeta[]>>;
  setActiveRpc: (rpcMeta: RpcMeta) => void;
}

export const AppContext = createContext<AppCtx>({
  activeChain: defaultChainConfig.chainId,
  rpcMetas: defaultChainConfig.rpcMetas,
  activeRpc: defaultChainConfig.rpcMetas[0],
  setActiveChain: () => undefined,
  setRpcMetas: () => undefined,
  setActiveRpc: () => undefined,
});

export function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [activeChain, _setActiveChain] = useState<AppCtx["activeChain"]>(defaultChainConfig.chainId);
  const [rpcMetas, setRpcMetas] = useState<AppCtx["rpcMetas"]>(defaultChainConfig.rpcMetas);
  const [activeRpc, _setActiveRpc] = useState<AppCtx["activeRpc"]>(defaultChainConfig.rpcMetas[0]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const setActiveChain = useCallback(
    (chainId: ChainID) => {
      _setActiveChain(chainId);
      localStorage.setItem(StoreKey.ACTIVE_CHAIN, chainId.toString());

      const chainConfig = getChainConfig(chainId);
      setRpcMetas(chainConfig.rpcMetas);
      _setActiveRpc(chainConfig.rpcMetas[0]);

      const params = new URLSearchParams(searchParams.toString());
      params.set(UrlParamsKey.NETWORK, chainConfig.name);
      params.set(UrlParamsKey.RPC, chainConfig.rpcMetas[0].url);

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setActiveRpc = useCallback(
    (rpcMeta: RpcMeta) => {
      _setActiveRpc(rpcMeta);

      const params = new URLSearchParams(searchParams.toString());
      params.set(UrlParamsKey.RPC, encodeURIComponent(rpcMeta.url));

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const urlChain = urlSearchParams.get(UrlParamsKey.NETWORK);
    const urlRpc = urlSearchParams.get(UrlParamsKey.RPC);

    const initChain = getInitChain(urlChain);

    _setActiveChain(initChain.chainId);
    localStorage.setItem(StoreKey.ACTIVE_CHAIN, initChain.chainId.toString());

    if (urlRpc) {
      const url = decodeURIComponent(urlRpc);

      setRpcMetas(
        initChain.rpcMetas.some((rpcMeta) => url === rpcMeta.url)
          ? [...initChain.rpcMetas]
          : [...initChain.rpcMetas, { url }]
      );
      _setActiveRpc({ url });
    } else {
      setRpcMetas(initChain.rpcMetas);
      _setActiveRpc(initChain.rpcMetas[0]);
    }
  }, []);

  return (
    <AppContext.Provider value={{ activeChain, rpcMetas, activeRpc, setActiveChain, setRpcMetas, setActiveRpc }}>
      {children}
    </AppContext.Provider>
  );
}
