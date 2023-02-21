import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWallet } from "@darwinia/app-providers";

const Protected = ({ children }: PropsWithChildren) => {
  const { isWalletConnected, isRequestingWalletConnection } = useWallet();
  const location = useLocation();
  //if the user isn't connected to the wallet, redirect to the homepage
  if (!isWalletConnected && !isRequestingWalletConnection) {
    return <Navigate to={`/${location.search}`} replace={true} state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default Protected;
