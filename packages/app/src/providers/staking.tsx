import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssetBalance, ChainID, Collator, StakingAmount, UserIntroValues } from "../types";
import { useWallet } from "../hooks";
import { WsProvider, ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import { BigNumber } from "ethers";
import { usePower } from "../hooks/power";
import { useLedger } from "../hooks/ledger";
import { useSession } from "../hooks/session";
import { useCollators } from "../hooks/collators";
import { useBalance } from "../hooks/balance";
import { keyring } from "@polkadot/ui-keyring";
import { AssetDistribution, Deposit } from "../types";
import { BaseProvider } from "@ethersproject/providers";
import { BN_ZERO } from "../config";
import { getChainConfig, isEthersApi, isWalletClient } from "../utils";
import { clientBuilder as sdkClientBuilder } from "darwinia-js-sdk";
import { clientBuilder as libClientBuilder } from "../libs";
import { getPublicClient } from "@wagmi/core";

interface StakingCtx {
  power: BigNumber | undefined;
  stakedAssetDistribution: AssetDistribution | undefined;
  deposits: Deposit[] | undefined;
  stakedDepositsIds: number[] | undefined;
  isLedgerLoading: boolean | undefined;
  isPoolLoading: boolean | undefined;
  collators: Collator[] | undefined;
  balance: AssetBalance | undefined;
  currentNominatedCollator: Collator | undefined | null;
  newUserIntroStakingValues: UserIntroValues | undefined;
  sessionDuration: number | undefined;
  unbondingDuration: number | undefined;
  minDeposit: BigNumber | undefined;
  calculatePower: (stakingAmount: StakingAmount) => BigNumber;
  calculateExtraPower: (stakingAmount: StakingAmount) => BigNumber;
  setNewUserIntroStakingValues: (values: UserIntroValues | undefined) => void;
  setCollatorSessionKey: (sessionKey: string) => Promise<boolean>;
  stakeAndNominate: (
    collatorAddress: string,
    ringAmount: BigNumber,
    ktonAmount: BigNumber,
    depositIds: BigNumber[]
  ) => Promise<boolean>;
}

const defaultValue: StakingCtx = {
  power: undefined,
  stakedAssetDistribution: undefined,
  stakedDepositsIds: undefined,
  deposits: undefined,
  isLedgerLoading: undefined,
  isPoolLoading: undefined,
  collators: undefined,
  balance: undefined,
  currentNominatedCollator: undefined,
  minDeposit: undefined,
  newUserIntroStakingValues: undefined,
  sessionDuration: undefined,
  unbondingDuration: undefined,
  calculatePower: () => BN_ZERO,
  calculateExtraPower: () => BN_ZERO,
  setNewUserIntroStakingValues: () => undefined,
  setCollatorSessionKey: async () => false,
  stakeAndNominate: async () => false,
};

export const StakingContext = createContext(defaultValue);

export const StakingProvider = ({ children }: PropsWithChildren) => {
  const isKeyringInitialized = useRef<boolean>(false);
  const { currentChain, activeAccount, signerApi } = useWallet();
  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const [polkadotApi, setPolkadotApi] = useState<ApiPromise>();
  const [newUserIntroStakingValues, setNewUserIntroStakingValues] = useState<UserIntroValues | undefined>();
  const [minDeposit, setMinDeposit] = useState<BigNumber>(BN_ZERO);
  const [currentNominatedCollator, setCurrentNominatedCollator] = useState<Collator | null>();

  const { collators } = useCollators(polkadotApi);
  const { sessionDuration, unbondingDuration } = useSession();
  const { stakingAmount, isLedgerLoading, deposits, stakedDepositsIds, stakedAssetDistribution } = useLedger({
    polkadotApi,
    address: activeAccount?.address,
    secondsPerBlock: chainConfig?.secondsPerBlock,
  });
  const { isPoolLoading, power, calculateExtraPower, calculatePower } = usePower({
    polkadotApi,
    stakingAmount,
  });
  const { balance } = useBalance(polkadotApi, activeAccount?.address);

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

  const getLibClient = useCallback(() => {
    const publicClient = getPublicClient();
    switch (chainConfig?.chainId) {
      case ChainID.PANGOLIN:
        return libClientBuilder.buildPangolinClient(publicClient);
      case ChainID.PANGORO:
        return libClientBuilder.buildPangoroClient(publicClient);
      case ChainID.DARWINIA:
        return libClientBuilder.buildDarwiniaClient(publicClient);
      case ChainID.CRAB:
      default:
        return libClientBuilder.buildCrabClient(publicClient);
    }
  }, [chainConfig]);

  const setCollatorSessionKey = useCallback(
    async (sessionKey: string) => {
      /* We appended 00 to the session key to represent that we don't need any proof. Originally the setKeys method
       * required two params which are session key and proof but here we append both values into one param */
      const proof = `${sessionKey}00` as HexString;

      if (isEthersApi(signerApi)) {
        try {
          await getSdkClient(signerApi).calls.session.setKeysH(signerApi.getSigner(), proof);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      } else if (isWalletClient(signerApi)) {
        try {
          await getLibClient().calls.session.setKeysH(signerApi, proof);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      return false;
    },
    [signerApi, getSdkClient, getLibClient]
  );

  const stakeAndNominate = useCallback(
    async (collatorAddress: string, ringAmount: BigNumber, ktonAmount: BigNumber, depositIds: BigNumber[]) => {
      if (isEthersApi(signerApi)) {
        const nominateCall = getSdkClient(signerApi).calls.darwiniaStaking.buildNominateCall(collatorAddress);
        const stakeCall = getSdkClient(signerApi).calls.darwiniaStaking.buildStakeCall(
          ringAmount.toString(),
          ktonAmount.toString(),
          depositIds.map((item) => item.toString())
        );

        try {
          await getSdkClient(signerApi).calls.utility.batchAll(signerApi.getSigner(), [stakeCall, nominateCall]);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      } else if (isWalletClient(signerApi)) {
        const nominateCall = getLibClient().calls.darwiniaStaking.buildNominateCall(collatorAddress);
        const stakeCall = getLibClient().calls.darwiniaStaking.buildStakeCall(
          ringAmount.toString(),
          ktonAmount.toString(),
          depositIds.map((item) => item.toString())
        );

        try {
          await getLibClient().calls.utility.batchAll(signerApi, [stakeCall, nominateCall]);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      return false;
    },
    [signerApi, getSdkClient, getLibClient]
  );

  useEffect(() => {
    if (activeAccount) {
      const collator = collators.find((item) =>
        item.nominators.map((nominator) => nominator.toLowerCase()).includes(activeAccount.address.toLowerCase())
      );
      setCurrentNominatedCollator(collator ?? null);
    }
  }, [collators, activeAccount]);

  /* This will help us to extract pretty names from the chain test accounts such as Alith,etc */
  useEffect(() => {
    try {
      if (chainConfig && !isKeyringInitialized.current) {
        keyring.loadAll({
          type: "ethereum",
          isDevelopment: !!chainConfig?.isTestNet,
        });
        isKeyringInitialized.current = true;
      }
    } catch (e) {
      //ignore
    }
  }, [chainConfig]);

  useEffect(() => {
    if (polkadotApi) {
      setMinDeposit(BigNumber.from(polkadotApi.consts.deposit.minLockingAmount.toString()));
    }
  }, [polkadotApi]);

  // init & update polkadotApi
  useEffect(() => {
    let api: ApiPromise | undefined = undefined;

    const errorHandler = () => {
      setPolkadotApi(undefined);
    };
    const readyHandler = () => {
      setPolkadotApi((prev) => prev ?? api);
    };
    const disconnectedHandler = () => {
      setPolkadotApi(undefined);
    };

    if (chainConfig) {
      const provider = new WsProvider(chainConfig.substrate.rpc.wss);
      api = new ApiPromise({ provider });
      api.on("error", errorHandler);
      api.on("ready", readyHandler);
      api.on("disconnected", disconnectedHandler);
    }

    return () => {
      api?.off("error", errorHandler);
      api?.off("ready", readyHandler);
      api?.off("disconnected", disconnectedHandler);
      setPolkadotApi(undefined);
    };
  }, [chainConfig]);

  return (
    <StakingContext.Provider
      value={{
        balance,
        power,
        stakedAssetDistribution,
        deposits,
        stakedDepositsIds,
        isPoolLoading,
        isLedgerLoading,
        collators,
        currentNominatedCollator,
        newUserIntroStakingValues,
        sessionDuration,
        unbondingDuration,
        minDeposit,
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
