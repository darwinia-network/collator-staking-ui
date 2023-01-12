import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AssetBalance, Collator, StakingAsset, StorageCtx, UserIntroValues } from "@darwinia/app-types";
import { useWallet } from "./walletProvider";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { FrameSystemAccountInfo } from "@darwinia/api-derive/accounts/types";
import usePower from "./hooks/usePower";
import useLedger from "./hooks/useLedger";
import BigNumber from "bignumber.js";
import useCollators from "./hooks/useCollators";
import { keyring } from "@polkadot/ui-keyring";

const initialState: StorageCtx = {
  power: undefined,
  stakedAssetDistribution: undefined,
  stakedDepositsIds: undefined,
  deposits: undefined,
  isLoadingLedger: undefined,
  isLoadingPool: undefined,
  collators: undefined,
  balance: undefined,
  currentlyNominatedCollator: undefined,
  // this whole function does nothing, it's just a blueprint
  calculatePower: (stakingAsset: StakingAsset): BigNumber => {
    return BigNumber(0);
  },
  calculateExtraPower: (stakingAsset: StakingAsset): BigNumber => {
    return BigNumber(0);
  },
  setNewUserIntroStakingValues: (values: UserIntroValues) => {
    //no nothing
  },
  newUserIntroStakingValues: undefined,
};

export type UnSubscription = () => void;

const StorageContext = createContext(initialState);

export const StorageProvider = ({ children }: PropsWithChildren) => {
  const { selectedNetwork, selectedAccount } = useWallet();
  const [apiPromise, setApiPromise] = useState<ApiPromise>();
  /* These will be used to show the staked values in the introduction layout */
  const [newUserIntroStakingValues, setNewUserIntroStakingValues] = useState<UserIntroValues | undefined>();
  /* Balance will be formed by manually combining data, ktonBalance from useLedger() hook and
   * and useEffect from storageProvider */
  const [balance, setBalance] = useState<AssetBalance>({
    kton: BigNumber(0),
    ring: BigNumber(0),
  });

  const { stakingAsset, isLoadingLedger, deposits, stakedDepositsIds, stakedAssetDistribution, ktonBalance } =
    useLedger({
      apiPromise,
      selectedAccount,
      secondsPerBlock: selectedNetwork?.secondsPerBlock,
    });
  const { isLoadingPool, power, calculateExtraPower, calculatePower } = usePower({
    apiPromise,
    stakingAsset,
  });

  const isKeyringInitialized = useRef<boolean>(false);
  const { collators } = useCollators(apiPromise);
  const [currentlyNominatedCollator, setCurrentlyNominatedCollator] = useState<Collator>();

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }
    const collator = collators.find((item) =>
      item.nominators.map((nominator) => nominator.toLowerCase()).includes(selectedAccount.toLowerCase())
    );
    setCurrentlyNominatedCollator(collator);
  }, [collators, selectedAccount]);

  useEffect(() => {
    setBalance((old) => {
      return {
        ...old,
        kton: ktonBalance,
      };
    });
  }, [ktonBalance]);

  /* This will help us to extract pretty names from the chain test accounts such as Alith,etc */
  useEffect(() => {
    try {
      if (selectedNetwork && !isKeyringInitialized.current) {
        isKeyringInitialized.current = true;
        keyring.loadAll({
          type: "ethereum",
          isDevelopment: selectedNetwork?.name === "Pangolin",
        });
      }
    } catch (e) {
      //ignore
    }
  }, [selectedNetwork]);

  const initStorageNetwork = async (rpcURL: string) => {
    try {
      const provider = new WsProvider(rpcURL);
      const api = new ApiPromise({
        provider,
      });

      api.on("connected", async () => {
        const readyAPI = await api.isReady;
        setApiPromise(readyAPI);
      });
      api.on("disconnected", () => {
        // console.log("disconnected");
      });
      api.on("error", () => {
        // console.log("error");
      });
    } catch (e) {
      //ignore
    }
  };

  /*Monitor account ring balance*/
  useEffect(() => {
    let unsubscription: UnSubscription | undefined;
    const getBalance = async () => {
      if (!selectedAccount || !apiPromise) {
        return;
      }
      try {
        const res = await apiPromise?.query.system.account(selectedAccount, (accountInfo: FrameSystemAccountInfo) => {
          setBalance((old) => {
            return {
              ...old,
              ring: BigNumber(accountInfo.data.free.toString()),
            };
          });
        });
        unsubscription = res as unknown as UnSubscription;
      } catch (e) {
        console.log(e);
        // ignore
      }
    };

    getBalance().catch(() => {
      //do nothing
    });

    return () => {
      if (unsubscription) {
        unsubscription();
      }
    };
  }, [apiPromise, selectedAccount]);

  useEffect(() => {
    if (!selectedNetwork) {
      return;
    }
    initStorageNetwork(selectedNetwork.substrate.wssURL);
  }, [selectedNetwork]);

  return (
    <StorageContext.Provider
      value={{
        balance,
        power,
        stakedAssetDistribution,
        deposits,
        stakedDepositsIds,
        isLoadingPool,
        isLoadingLedger,
        calculateExtraPower,
        calculatePower,
        collators,
        currentlyNominatedCollator,
        setNewUserIntroStakingValues,
        newUserIntroStakingValues,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
