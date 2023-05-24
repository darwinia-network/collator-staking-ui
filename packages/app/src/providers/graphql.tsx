import { PropsWithChildren, useMemo } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useWallet } from "../hooks";
import { getChainConfig } from "../utils";

export const GraphQLProvider = ({ children }: PropsWithChildren) => {
  const { currentChain } = useWallet();

  const client = useMemo(() => {
    return new ApolloClient({
      uri: currentChain ? getChainConfig(currentChain)?.substrate.graphql : "",
      cache: new InMemoryCache(),
    });
  }, [currentChain]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
