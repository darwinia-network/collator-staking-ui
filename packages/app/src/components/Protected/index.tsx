import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWallet } from "../../hooks";

export const Protected = ({ children }: PropsWithChildren) => {
  const { signerApi } = useWallet();
  const location = useLocation();

  if (!signerApi) {
    return <Navigate to={`/${location.search}`} replace={true} state={{ from: location }} />;
  }

  return <>{children}</>;
};
