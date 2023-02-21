import { PropsWithChildren, useMemo } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useWallet } from "./walletProvider";

export const GraphQLProvider = ({ children }: PropsWithChildren) => {
  const { selectedNetwork } = useWallet();
  const client = useMemo(() => {
    return new ApolloClient({
      uri: selectedNetwork?.substrate.graphQlURL,
      cache: new InMemoryCache(),
    });
  }, [selectedNetwork]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
