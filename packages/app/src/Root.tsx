import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { notification, Spinner } from "@darwinia/ui";
import { useWallet } from "@darwinia/app-providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getStore, setStore } from "@darwinia/app-utils";
import { ethers } from "ethers";
import { clientBuilder } from "darwinia-js-sdk";

const Root = () => {
  const {
    isRequestingWalletConnection,
    error,
    connectWallet,
    isWalletConnected,
    selectedNetwork,
    isLoadingTransaction,
  } = useWallet();
  const [loading, setLoading] = useState<boolean | undefined>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(isRequestingWalletConnection || isLoadingTransaction);
  }, [isRequestingWalletConnection, isWalletConnected, isLoadingTransaction]);

  const redirect = useCallback(() => {
    setStore("isConnectedToWallet", true);
    if (location.pathname === "/") {
      navigate(`/staking${location.search}`, { replace: true });
      return;
    }

    /* only navigate if the user is supposed to be redirected to another URL */
    if (location.state && location.state.from) {
      const nextPath = location.state.from.pathname ? location.state.from.pathname : "/staking";
      navigate(`${nextPath}${location.search}`, { replace: true });
    }
  }, [location, navigate]);

  /*Monitor wallet connection and redirect to the required location */
  useEffect(() => {
    if (isWalletConnected) {
      redirect();
    }
  }, [isWalletConnected]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: <div>{error.message}</div>,
      });
    }
  }, [error]);

  //check if it should auto connect to wallet or wait for the user to click the connect wallet button
  useEffect(() => {
    const shouldAutoConnect = getStore<boolean>("isConnectedToWallet");
    if (shouldAutoConnect) {
      connectWallet();
    }
  }, [selectedNetwork]);

  return (
    <Spinner isLoading={!!loading} maskClassName={"!fixed !z-[99]"}>
      <div className={"w-full"}>
        <Header />
        <div className={"flex flex-col min-h-screen justify-center flex-1 pt-[80px] lg:pt-[90px]"}>
          {/*apply padding*/}
          <div className={"flex flex-1 flex-col wrapper-padding items-center"}>
            {/*apply max-width*/}
            <div className={"flex flex-col flex-1 app-container w-full"}>
              <Outlet />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </Spinner>
  );
};

export default Root;
