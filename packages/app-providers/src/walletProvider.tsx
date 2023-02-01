import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import { dAppSupportedWallets } from "@darwinia/app-config";
import { ChainConfig, WalletCtx, WalletError, SupportedWallet, WalletConfig } from "@darwinia/app-types";
import { Contract, ethers } from "ethers";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";

/*This is just a blueprint, no value will be stored in here*/
const initialState: WalletCtx = {
  provider: undefined,
  signer: undefined,
  isRequestingWalletConnection: false,
  isWalletConnected: false,
  error: undefined,
  selectedAccount: undefined,
  depositContract: undefined,
  stakingContract: undefined,
  selectedNetwork: undefined,
  isLoadingTransaction: undefined,
  selectedWalletConfig: undefined,
  selectWallet: (walletConfig: WalletConfig) => {
    //do nothing
  },
  changeSelectedNetwork: () => {
    // do nothing
  },
  connectWallet: () => {
    //do nothing
  },
  disconnectWallet: () => {
    //do nothing
  },
  addKTONtoWallet: () => {
    //do nothing
  },
  forceSetAccountAddress: (address: string) => {
    //do nothing
  },
  setTransactionStatus: (isLoading: boolean) => {
    //do nothing
  },
};

const WalletContext = createContext<WalletCtx>(initialState);

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [depositContract, setDepositContract] = useState<Contract>();
  const [stakingContract, setStakingContract] = useState<Contract>();
  const [isRequestingWalletConnection, setRequestingWalletConnection] = useState<boolean>(false);
  const [isWalletConnected, setWalletConnected] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const forcedAccountAddress = useRef<string>();
  const [error, setError] = useState<WalletError | undefined>(undefined);
  const [selectedNetwork, setSelectedNetwork] = useState<ChainConfig>();
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet>("MetaMask");
  const [selectedWalletConfig, setSelectedWalletConfig] = useState<WalletConfig>();
  const [isLoadingTransaction, setLoadingTransaction] = useState<boolean>(false);

  /*useEffect(() => {
    if (!provider) {
      return;
    }
    console.log("start listening to blocks=====");
    provider.on("block", (block) => {
      console.log("new block=====🚒", block);
    });
  }, [provider]);*/

  const isWalletInstalled = () => {
    return !!window.ethereum;
  };

  useEffect(() => {
    const walletConfig = dAppSupportedWallets.find((walletConfig) => walletConfig.name === selectedWallet);
    if (walletConfig) {
      setSelectedWalletConfig(walletConfig);
    }
  }, [selectedWallet]);

  /* Listen to metamask account changes */
  useEffect(() => {
    if (!isWalletInstalled() || !isWalletConnected) {
      setSelectedAccount(undefined);
      return;
    }

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const account = forcedAccountAddress.current ? forcedAccountAddress.current : accounts[0];
        setSelectedAccount(account);
      }
    };

    const onChainChanged = () => {
      setWalletConnected(false);
      /*Metamask recommends reloading the whole page ref: https://docs.metamask.io/guide/ethereum-provider.html#events */
      window.location.reload();
    };

    window.ethereum?.on<string[]>("accountsChanged", onAccountsChanged);
    window.ethereum?.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, [isWalletConnected]);

  const addKTONtoWallet = useCallback(async () => {
    try {
      if (!isWalletInstalled() || !selectedNetwork) {
        return;
      }

      const ktonConfig = selectedNetwork.kton;

      const isSuccessful = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: ktonConfig.address,
            symbol: ktonConfig.symbol,
            decimals: ktonConfig.decimals,
            image: ktonConfig.logo,
          },
        },
      });

      if (!isSuccessful) {
        return;
      }
    } catch (e) {
      //ignore
      // console.log(e);
    }
  }, [selectedNetwork]);

  const disconnectWallet = useCallback(() => {
    setSelectedAccount(undefined);
    setProvider(undefined);
    setDepositContract(undefined);
    setStakingContract(undefined);
    setWalletConnected(false);
  }, []);

  /*Connect to MetaMask*/
  const connectWallet = useCallback(async () => {
    if (!selectedNetwork || isRequestingWalletConnection) {
      return;
    }
    try {
      setWalletConnected(false);
      if (!isWalletInstalled()) {
        setError({
          code: 0,
          message: "Wallet is not installed",
        });
        setWalletConnected(false);
        return;
      }

      setRequestingWalletConnection(true);
      //try switching the token to the selected network token
      const chainResponse = await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexlify(selectedNetwork.chainId) }],
      });
      if (!chainResponse) {
        //The chain was switched successfully, request account permission
        // request account permission
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            const account = forcedAccountAddress.current ? forcedAccountAddress.current : accounts[0];
            setSelectedAccount(account);
            setRequestingWalletConnection(false);
            setWalletConnected(true);
          }
        } catch (e) {
          setRequestingWalletConnection(false);
          setWalletConnected(false);
          setError({
            code: 4,
            message: "Account access permission rejected",
          });
        }
      }
    } catch (e) {
      if ((e as { code: number }).code === 4902) {
        /*Unrecognized chain, add it first*/
        try {
          const addedChainResponse = await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ethers.utils.hexlify(selectedNetwork.chainId),
                chainName: selectedNetwork.name,
                nativeCurrency: {
                  ...selectedNetwork.ring,
                },
                rpcUrls: [...selectedNetwork.httpsURLs],
                blockExplorerUrls: [...selectedNetwork.explorerURLs],
              },
            ],
          });
          if (!addedChainResponse) {
            // request account permission
            try {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              if (accounts && Array.isArray(accounts) && accounts.length > 0) {
                const account = forcedAccountAddress.current ? forcedAccountAddress.current : accounts[0];
                setSelectedAccount(account);
                setRequestingWalletConnection(false);
                setWalletConnected(true);
              }
            } catch (e) {
              setRequestingWalletConnection(false);
              setError({
                code: 4,
                message: "Account access permission rejected",
              });
              setWalletConnected(false);
            }
          }
        } catch (e) {
          setError({
            code: 1,
            message: "User rejected adding ethereum chain",
          });
          setRequestingWalletConnection(false);
          setWalletConnected(false);
        }
        return;
      }
      setRequestingWalletConnection(false);
      setWalletConnected(false);
      if ((e as { code: number }).code === 4001) {
        setError({
          code: 4,
          message: "Account access permission rejected",
        });
      } else {
        setError({
          code: 5,
          message: "Something else happened",
        });
      }
    }
  }, [isWalletInstalled, selectedNetwork, isRequestingWalletConnection]);

  const changeSelectedNetwork = useCallback(
    (network: ChainConfig) => {
      setSelectedNetwork(network);
    },
    [selectedNetwork]
  );

  /*This will be fired once the connection to the wallet is successful*/
  useEffect(() => {
    if (!isWalletConnected || !selectedAccount || !selectedNetwork) {
      return;
    }
    //refresh the page with the newly selected account
    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    const newSigner = newProvider.getSigner();
    const newStakingContract = new ethers.Contract(
      selectedNetwork.contractAddresses.staking,
      selectedNetwork.contractInterface.staking,
      newSigner
    );
    const newDepositContract = new ethers.Contract(
      selectedNetwork.contractAddresses.deposit,
      selectedNetwork.contractInterface.deposit,
      newSigner
    );
    setProvider(newProvider);
    setSigner(newSigner);
    setStakingContract(newStakingContract);
    setDepositContract(newDepositContract);
  }, [selectedAccount, isWalletConnected, selectedNetwork]);

  const forceSetAccountAddress = useCallback((accountAddress: string) => {
    forcedAccountAddress.current = accountAddress;
  }, []);

  const setTransactionStatus = useCallback((isLoading: boolean) => {
    setLoadingTransaction(isLoading);
  }, []);

  const selectWallet = useCallback((walletConfig: WalletConfig) => {
    setSelectedWallet(walletConfig.name);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isLoadingTransaction,
        setTransactionStatus,
        disconnectWallet,
        provider,
        isWalletConnected,
        depositContract,
        stakingContract,
        signer,
        selectedAccount,
        isRequestingWalletConnection,
        connectWallet,
        addKTONtoWallet,
        error,
        changeSelectedNetwork,
        selectedNetwork,
        forceSetAccountAddress,
        selectedWalletConfig,
        selectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
