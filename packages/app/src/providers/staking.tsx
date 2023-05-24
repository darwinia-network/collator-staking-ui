import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssetBalance, ChainID, Collator, StakingAsset, UserIntroValues } from "../types";
import { useWallet } from "../hooks";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { BigNumber } from "ethers";
import { usePower } from "../hooks/power";
import { useLedger } from "../hooks/ledger";
import { useSession } from "../hooks/session";
import { useCollators } from "../hooks/collators";
import { keyring } from "@polkadot/ui-keyring";
import { AssetDistribution, Deposit, StakeAndNominateParams, FrameSystemAccountInfo } from "../types";
import { BaseProvider } from "@ethersproject/providers";
import { BN_ZERO } from "../config";
import { getChainConfig } from "../utils";
import { clientBuilder as sdkClientBuilder } from "darwinia-js-sdk";

interface StakingCtx {
  power: BigNumber | undefined;
  stakedAssetDistribution: AssetDistribution | undefined;
  deposits: Deposit[] | undefined;
  stakedDepositsIds: number[] | undefined;
  isLoadingLedger: boolean | undefined;
  isLoadingPool: boolean | undefined;
  collators: Collator[] | undefined;
  balance: AssetBalance | undefined;
  currentlyNominatedCollator: Collator | undefined | null;
  newUserIntroStakingValues: UserIntroValues | undefined;
  sessionDuration: number | undefined;
  unbondingDuration: number | undefined;
  minimumDepositAmount: BigNumber | undefined;
  calculatePower: (stakingAsset: StakingAsset) => BigNumber;
  calculateExtraPower: (stakingAsset: StakingAsset) => BigNumber;
  setNewUserIntroStakingValues: (values: UserIntroValues | undefined) => void;
  setCollatorSessionKey: (sessionKey: string, provider: BaseProvider) => Promise<boolean>;
  stakeAndNominate: (params: StakeAndNominateParams) => Promise<boolean>;
}

const defaultValue: StakingCtx = {
  power: undefined,
  stakedAssetDistribution: undefined,
  stakedDepositsIds: undefined,
  deposits: undefined,
  isLoadingLedger: undefined,
  isLoadingPool: undefined,
  collators: undefined,
  balance: undefined,
  currentlyNominatedCollator: undefined,
  minimumDepositAmount: undefined,
  newUserIntroStakingValues: undefined,
  sessionDuration: undefined,
  unbondingDuration: undefined,
  calculatePower: () => BN_ZERO,
  calculateExtraPower: () => BN_ZERO,
  setNewUserIntroStakingValues: () => undefined,
  setCollatorSessionKey: async () => false,
  stakeAndNominate: async () => false,
};

export type UnSubscription = () => void;

export const StakingContext = createContext(defaultValue);

export const StakingProvider = ({ children }: PropsWithChildren) => {
  const { currentChain, activeAccount } = useWallet();
  const [apiPromise, setApiPromise] = useState<ApiPromise>();
  /* These will be used to show the staked values in the introduction layout */
  const [newUserIntroStakingValues, setNewUserIntroStakingValues] = useState<UserIntroValues | undefined>();
  /* Balance will be formed by manually combining data, ktonBalance from useLedger() hook and
   * and useEffect from storageProvider */
  const [balance, setBalance] = useState<AssetBalance>({
    kton: BN_ZERO,
    ring: BN_ZERO,
  });
  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);
  const [minimumDepositAmount, setMinimumDepositAmount] = useState<BigNumber>(BN_ZERO);

  const { stakingAsset, isLoadingLedger, deposits, stakedDepositsIds, stakedAssetDistribution, ktonBalance } =
    useLedger({
      apiPromise,
      activeAccount,
      secondsPerBlock: chainConfig?.secondsPerBlock,
    });
  const { isLoadingPool, power, calculateExtraPower, calculatePower } = usePower({
    apiPromise,
    stakingAsset,
  });

  const { sessionDuration, unbondingDuration } = useSession();

  const isKeyringInitialized = useRef<boolean>(false);
  const { collators } = useCollators(apiPromise);
  const [currentlyNominatedCollator, setCurrentlyNominatedCollator] = useState<Collator | null>();

  const getSdkClient = useCallback(
    (provider: BaseProvider) => {
      switch (chainConfig?.chainId) {
        case ChainID.PANGOLIN:
          return sdkClientBuilder.buildPangolinClient(provider);
        case ChainID.PANGORO:
          return sdkClientBuilder.buildPangoroClient(provider);
        case ChainID.DARWINIA:
          return sdkClientBuilder.buildDarwiniaClient(provider);
        case ChainID.CRAB:
        default:
          return sdkClientBuilder.buildCrabClient(provider);
      }
    },
    [chainConfig]
  );

  const setCollatorSessionKey = useCallback(async () => {
    return false;
  }, []);

  const stakeAndNominate = useCallback(async () => {
    return false;
  }, []);

  useEffect(() => {
    if (!activeAccount) {
      return;
    }
    const collator = collators.find((item) =>
      item.nominators.map((nominator) => nominator.toLowerCase()).includes(activeAccount.toLowerCase())
    );
    setCurrentlyNominatedCollator(collator ?? null);
  }, [collators, activeAccount]);

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
      if (chainConfig && !isKeyringInitialized.current) {
        isKeyringInitialized.current = true;
        keyring.loadAll({
          type: "ethereum",
          isDevelopment: !!chainConfig?.isTestNet,
        });
      }
    } catch (e) {
      //ignore
    }
  }, [chainConfig]);

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

  /*Get the minimum deposit amount*/
  useEffect(() => {
    if (!apiPromise) {
      return;
    }
    const amount = apiPromise.consts.deposit.minLockingAmount;
    setMinimumDepositAmount(BigNumber.from(amount));
  }, [apiPromise]);

  /*Monitor account ring balance*/
  useEffect(() => {
    let unsubscription: UnSubscription | undefined;
    const getBalance = async () => {
      if (!activeAccount || !apiPromise) {
        return;
      }
      try {
        const res = await apiPromise?.query.system.account(activeAccount, (accountInfo: FrameSystemAccountInfo) => {
          setBalance((old) => {
            return {
              ...old,
              ring: BigNumber.from(accountInfo.data.free),
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
  }, [apiPromise, activeAccount]);

  useEffect(() => {
    if (!chainConfig) {
      return;
    }
    initStorageNetwork(chainConfig.substrate.rpc.wss);
  }, [chainConfig]);

  return (
    <StakingContext.Provider
      value={{
        balance,
        power,
        stakedAssetDistribution,
        deposits,
        stakedDepositsIds,
        isLoadingPool,
        isLoadingLedger,
        collators,
        currentlyNominatedCollator,
        newUserIntroStakingValues,
        sessionDuration,
        unbondingDuration,
        minimumDepositAmount,
        calculatePower,
        calculateExtraPower,
        setNewUserIntroStakingValues,
        setCollatorSessionKey,
        stakeAndNominate,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
