"use client";

import { useApp } from "@/hooks";
import { getChainConfig } from "@/utils";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { from } from "rxjs";

interface ApiCtx {
  polkadotApi: ApiPromise | null;
}

const defaultValue: ApiCtx = {
  polkadotApi: null,
};

export const ApiContext = createContext(defaultValue);

export function ApiProvider({ children }: PropsWithChildren<unknown>) {
  const [polkadotApi, setPolkadotApi] = useState(defaultValue.polkadotApi);
  const { activeChain } = useApp();

  useEffect(() => {
    const chainConfig = getChainConfig(activeChain);

    const sub$$ = from(ApiPromise.create({ provider: new WsProvider(chainConfig.substrate.rpc.wss) })).subscribe({
      next: setPolkadotApi,
      error: (err) => {
        setPolkadotApi(defaultValue.polkadotApi);
        console.error(err);
      },
    });

    return () => sub$$.unsubscribe();
  }, [activeChain]);

  return <ApiContext.Provider value={{ polkadotApi }}>{children}</ApiContext.Provider>;
}
