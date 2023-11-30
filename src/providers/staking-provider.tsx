"use client";

import {
  useActiveCollators,
  useApi,
  useCollatorCommission,
  useCollatorLastSessionBlocks,
  useCollatorNominators,
  useCollatorPower,
  useCollatorSessionKey,
  useDeposits,
  useLedger,
  useNominatorCollators,
  usePool,
} from "@/hooks";
import { stakingToPower } from "@/utils";
import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Deposit, UnbondingInfo } from "@/types";

interface StakingCtx {
  deposits: Deposit[];
  stakedDeposits: number[];
  power: bigint;
  ringPool: bigint;
  ktonPool: bigint;
  stakedRing: bigint;
  stakedKton: bigint;
  stakedDeposit: bigint;
  activeCollators: string[];
  collatorPower: { [collator: string]: bigint | undefined };
  collatorSessionKey: { [collator: string]: string | undefined };
  collatorCommission: { [collator: string]: string | undefined };
  collatorLastSessionBlocks: { [collator: string]: number | undefined };
  collatorNominators: { [collator: string]: string[] | undefined };
  nominatorCollators: { [nominator: string]: string[] | undefined };
  unbondingRing: Omit<UnbondingInfo, "depositId">[];
  unbondingKton: Omit<UnbondingInfo, "depositId">[];
  unbondingDeposits: UnbondingInfo[];
  minimumDeposit: bigint;
  maxCommission: number;

  isLedgersInitialized: boolean;
  isDepositsInitialized: boolean;
  isRingPoolInitialized: boolean;
  isKtonPoolInitialized: boolean;
  isActiveCollatorsInitialized: boolean;
  isCollatorPowerInitialized: boolean;
  isCollatorSessionKeyInitialized: boolean;
  isCollatorCommissionInitialized: boolean;
  isCollatorLastSessionBlocksInitialized: boolean;
  isCollatorNominatorsInitialized: boolean;
  isNominatorCollatorsInitialized: boolean;

  isCollatorCommissionLoading: boolean;
  isNominatorCollatorsLoading: boolean;

  calcExtraPower: (stakingRing: bigint, stakingKton: bigint) => bigint;
  updateNominatorCollators: () => void;
  updateCollatorCommission: () => void;
}

const defaultValue: StakingCtx = {
  deposits: [],
  stakedDeposits: [],
  power: 0n,
  ringPool: 0n,
  ktonPool: 0n,
  stakedRing: 0n,
  stakedKton: 0n,
  stakedDeposit: 0n,
  activeCollators: [],
  collatorPower: {},
  collatorSessionKey: {},
  collatorCommission: {},
  collatorLastSessionBlocks: {},
  collatorNominators: {},
  nominatorCollators: {},
  unbondingRing: [],
  unbondingKton: [],
  unbondingDeposits: [],
  minimumDeposit: 0n,
  maxCommission: 100, // 100%

  isLedgersInitialized: false,
  isDepositsInitialized: false,
  isRingPoolInitialized: false,
  isKtonPoolInitialized: false,
  isActiveCollatorsInitialized: false,
  isCollatorPowerInitialized: false,
  isCollatorSessionKeyInitialized: false,
  isCollatorCommissionInitialized: false,
  isCollatorLastSessionBlocksInitialized: false,
  isCollatorNominatorsInitialized: false,
  isNominatorCollatorsInitialized: false,

  isNominatorCollatorsLoading: false,
  isCollatorCommissionLoading: false,

  calcExtraPower: () => 0n,
  updateNominatorCollators: () => undefined,
  updateCollatorCommission: () => undefined,
};

export const StakingContext = createContext(defaultValue);

export function StakingProvider({ children }: PropsWithChildren<unknown>) {
  const { polkadotApi } = useApi();
  const [minimumDeposit, setMinimumDeposit] = useState(defaultValue.minimumDeposit);
  const [maxCommission, setMaxCommission] = useState(defaultValue.maxCommission);

  const { collatorLastSessionBlocks, isCollatorLastSessionBlocksInitialized } =
    useCollatorLastSessionBlocks(defaultValue);
  const { ringPool, ktonPool, isRingPoolInitialized, isKtonPoolInitialized } = usePool(defaultValue);
  const { activeCollators, isActiveCollatorsInitialized } = useActiveCollators(defaultValue);
  const { deposits, isDepositsInitialized } = useDeposits(defaultValue);
  const {
    stakedRing,
    stakedKton,
    stakedDeposits,
    stakedDeposit,
    unbondingRing,
    unbondingKton,
    unbondingDeposits,
    isLedgersInitialized,
  } = useLedger(deposits, defaultValue);
  const { collatorSessionKey, isCollatorSessionKeyInitialized } = useCollatorSessionKey(defaultValue);
  const { collatorCommission, isCollatorCommissionInitialized, isCollatorCommissionLoading, updateCollatorCommission } =
    useCollatorCommission(defaultValue);
  const { nominatorCollators, isNominatorCollatorsInitialized, isNominatorCollatorsLoading, updateNominatorCollators } =
    useNominatorCollators(defaultValue);
  const { collatorNominators, isCollatorNominatorsInitialized } = useCollatorNominators(defaultValue);
  const { collatorPower, isCollatorPowerInitialized } = useCollatorPower(
    collatorNominators,
    ringPool,
    ktonPool,
    defaultValue
  );

  const power = useMemo(
    () => stakingToPower(stakedRing + stakedDeposit, stakedKton, ringPool, ktonPool),
    [stakedRing, stakedKton, ringPool, ktonPool, stakedDeposit]
  );

  const calcExtraPower = useCallback(
    (stakingRing: bigint, stakingKton: bigint) =>
      stakingToPower(stakingRing, stakingKton, ringPool + stakingRing, ktonPool + stakingKton) -
      stakingToPower(0n, 0n, ringPool, ktonPool),
    [ringPool, ktonPool]
  );

  useEffect(() => {
    setMinimumDeposit(BigInt(polkadotApi?.consts.deposit.minLockingAmount.toString() || 0));
    setMaxCommission(Number(polkadotApi?.consts.darwiniaStaking.maxCommission?.toJSON() || 1000000000) / 10000000);
  }, [polkadotApi]);

  return (
    <StakingContext.Provider
      value={{
        power,
        deposits,
        stakedDeposits,
        ringPool,
        ktonPool,
        stakedRing,
        stakedKton,
        stakedDeposit,
        activeCollators,
        collatorPower,
        collatorSessionKey,
        collatorCommission,
        collatorLastSessionBlocks,
        collatorNominators,
        nominatorCollators,
        unbondingRing,
        unbondingKton,
        unbondingDeposits,
        minimumDeposit,
        maxCommission,

        isLedgersInitialized,
        isDepositsInitialized,
        isRingPoolInitialized,
        isKtonPoolInitialized,
        isActiveCollatorsInitialized,
        isCollatorPowerInitialized,
        isCollatorSessionKeyInitialized,
        isCollatorCommissionInitialized,
        isCollatorLastSessionBlocksInitialized,
        isCollatorNominatorsInitialized,
        isNominatorCollatorsInitialized,

        isNominatorCollatorsLoading,
        isCollatorCommissionLoading,

        calcExtraPower,
        updateNominatorCollators,
        updateCollatorCommission,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}
