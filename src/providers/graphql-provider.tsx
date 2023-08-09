"use client";

import { useApp } from "@/hooks";
import { getChainConfig } from "@/utils";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { PropsWithChildren } from "react";

export function GraphQLProvider({ children }: PropsWithChildren<unknown>) {
  const { activeChain } = useApp();

  const client = new ApolloClient({
    uri: getChainConfig(activeChain).substrate.graphql.endpoint,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
