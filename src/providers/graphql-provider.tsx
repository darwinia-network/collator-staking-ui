"use client";

import { useApp } from "@/hooks";
import { getChainConfig } from "@/utils";
import { ClientContext, GraphQLClient } from "graphql-hooks";
import memCache from "graphql-hooks-memcache";
import { PropsWithChildren } from "react";

export function GraphQLProvider({ children }: PropsWithChildren<unknown>) {
  const { activeChain } = useApp();

  const client = new GraphQLClient({
    url: getChainConfig(activeChain).substrate.graphql.endpoint,
    cache: memCache(),
  });

  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>;
}
