"use client";

import { useApi, useApp, useBlock } from "@/hooks";
import { calcKtonReward, calcMonths, getChainConfig, stakingToPower } from "@/utils";
import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Balance } from "@polkadot/types/interfaces";
import type { Option, Vec, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";
import { useAccount } from "wagmi";
import { Subscription, EMPTY, from } from "rxjs";
import type { DarwiniaStakingLedger, Deposit, DepositCodec, UnbondingInfo } from "@/types";

interface StakingCtx {
  deposits: Deposit[];
  stakedDeposits: number[];
  power: bigint;
  ringPool: bigint;
  ktonPool: bigint;
  stakedRing: bigint;
  stakedKton: bigint;
  totalOfDepositsInStaking: bigint;
  activeCollators: string[];
  collatorCommission: { [collator: string]: string | undefined };
  collatorLastSessionBlocks: { [collator: string]: number | undefined };
  collatorNominators: {
    [collator: string]:
      | {
          totalStakedPower: bigint;
          nominators: { address: string; stakedPower: bigint }[];
        }
      | undefined;
  };
  nominatorCollators: { [nominator: string]: string[] | undefined };
  unbondingRing: Omit<UnbondingInfo, "depositId">[];
  unbondingKton: Omit<UnbondingInfo, "depositId">[];
  unbondingDeposits: UnbondingInfo[];
  minimumDeposit: bigint;

  isLedgersInitialized: boolean;
  isDepositsInitialized: boolean;
  isRingPoolInitialized: boolean;
  isKtonPoolInitialized: boolean;
  isActiveCollatorsInitialized: boolean;
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
  totalOfDepositsInStaking: 0n,
  activeCollators: [],
  collatorCommission: {},
  collatorLastSessionBlocks: {},
  collatorNominators: {},
  nominatorCollators: {},
  unbondingRing: [],
  unbondingKton: [],
  unbondingDeposits: [],
  minimumDeposit: 0n,

  isLedgersInitialized: false,
  isDepositsInitialized: false,
  isRingPoolInitialized: false,
  isKtonPoolInitialized: false,
  isActiveCollatorsInitialized: false,
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
  const [deposits, setDeposits] = useState(defaultValue.deposits);
  const [stakedDeposits, setStakedDeposits] = useState(defaultValue.stakedDeposits);
  const [ringPool, setRingPool] = useState(defaultValue.ringPool);
  const [ktonPool, setKtonPool] = useState(defaultValue.ktonPool);
  const [stakedRing, setStakedRing] = useState(defaultValue.stakedRing);
  const [stakedKton, setStakedKton] = useState(defaultValue.stakedKton);
  const [totalOfDepositsInStaking, setTotalOfDepositsInStaking] = useState(defaultValue.totalOfDepositsInStaking);
  const [activeCollators, setActiveCollators] = useState(defaultValue.activeCollators);
  const [collatorCommission, setCollatorCommission] = useState(defaultValue.collatorCommission);
  const [collatorLastSessionBlocks, setCollatorLastSessionBlocks] = useState(defaultValue.collatorLastSessionBlocks);
  const [collatorNominators, setCollatorNominators] = useState(defaultValue.collatorNominators);
  const [nominatorCollators, setNominatorCollators] = useState(defaultValue.nominatorCollators);
  const [unbondingRing, setUnbondingRing] = useState(defaultValue.unbondingRing);
  const [unbondingKton, setUnbondingKton] = useState(defaultValue.unbondingKton);
  const [unbondingDeposits, setUnbondingDeposits] = useState(defaultValue.unbondingDeposits);
  const [minimumDeposit, setMinimumDeposit] = useState(defaultValue.minimumDeposit);

  const [isLedgersInitialized, setIsLedgersInitialized] = useState(defaultValue.isLedgersInitialized);
  const [isDepositsInitialized, setIsDepositsInitialized] = useState(defaultValue.isDepositsInitialized);
  const [isRingPoolInitialized, setIsRingPoolInitialized] = useState(defaultValue.isRingPoolInitialized);
  const [isKtonPoolInitialized, setIsKtonPoolInitialized] = useState(defaultValue.isKtonPoolInitialized);
  const [isActiveCollatorsInitialized, setIsActiveCollatorsInitialized] = useState(
    defaultValue.isActiveCollatorsInitialized
  );
  const [isCollatorCommissionInitialized, setIsCollatorCommissionInitialized] = useState(
    defaultValue.isCollatorCommissionInitialized
  );
  const [isCollatorLastSessionBlocksInitialized, setIsCollatorLastSessionBlocksInitialized] = useState(
    defaultValue.isCollatorLastSessionBlocksInitialized
  );
  const [isCollatorNominatorsInitialized, setIsCollatorNominatorsInitialized] = useState(
    defaultValue.isCollatorNominatorsInitialized
  );
  const [isNominatorCollatorsInitialized, setIsNominatorCollatorsInitialized] = useState(
    defaultValue.isNominatorCollatorsInitialized
  );

  const [isNominatorCollatorsLoading, setIsNominatorCollatorsLoading] = useState(
    defaultValue.isNominatorCollatorsLoading
  );
  const [isCollatorCommissionLoading, setIsCollatorCommissionLoading] = useState(
    defaultValue.isNominatorCollatorsLoading
  );

  const { address } = useAccount();
  const { polkadotApi } = useApi();
  const { blockTimestamp, blockNumber } = useBlock();
  const { activeChain } = useApp();

  const power = useMemo(
    () => stakingToPower(stakedRing + totalOfDepositsInStaking, stakedKton, ringPool, ktonPool),
    [stakedRing, stakedKton, ringPool, ktonPool, totalOfDepositsInStaking]
  );

  const calcExtraPower = useCallback(
    (stakingRing: bigint, stakingKton: bigint) =>
      stakingToPower(stakingRing, stakingKton, ringPool + stakingRing, ktonPool + stakingKton) -
      stakingToPower(0n, 0n, ringPool, ktonPool),
    [ringPool, ktonPool]
  );

  const updateNominatorCollators = useCallback(() => {
    if (polkadotApi) {
      setIsNominatorCollatorsLoading(true);

      return from(polkadotApi.query.darwiniaStaking.nominators.entries()).subscribe({
        next: (entries) =>
          setNominatorCollators(
            (entries as [StorageKey<AnyTuple>, Option<Codec>][]).reduce((acc, cur) => {
              const [key, result] = cur;
              const nominator = key.args[0].toHuman() as string;
              if (result.isSome) {
                const collator = result.unwrap().toHuman() as string;
                return { ...acc, [nominator]: [collator] };
              }
              return acc;
            }, {})
          ),
        error: console.error,
        complete: () => {
          setIsNominatorCollatorsInitialized(true);
          setIsNominatorCollatorsLoading(false);
        },
      });
    } else {
      setNominatorCollators({});
      return EMPTY.subscribe();
    }
  }, [polkadotApi]);

  const updateCollatorCommission = useCallback(() => {
    if (polkadotApi) {
      setIsCollatorCommissionLoading(true);

      return from(polkadotApi.query.darwiniaStaking.collators.entries()).subscribe({
        next: (entries) =>
          setCollatorCommission(
            entries.reduce((acc, cur) => {
              const [key, result] = cur;
              const collator = key.args[0].toHuman() as string;
              const commission = `${result.toHuman()}`;
              return { ...acc, [collator]: commission };
            }, {})
          ),
        error: console.error,
        complete: () => {
          setIsCollatorCommissionInitialized(true);
          setIsCollatorCommissionLoading(false);
        },
      });
    } else {
      setCollatorCommission({});
      return EMPTY.subscribe();
    }
  }, [polkadotApi]);

  useEffect(() => {
    setMinimumDeposit(BigInt(polkadotApi?.consts.deposit.minLockingAmount.toString() || 0));
  }, [polkadotApi]);

  // active collators
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.session
      .validators((addresses: Codec) => {
        // these are the collators that are active in this session
        setActiveCollators(addresses.toJSON() as string[]);
      })
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsActiveCollatorsInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // collator's nominators
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking.exposures
      .entries((entries: [StorageKey<AnyTuple>, Codec][]) => {
        setCollatorNominators(
          entries.reduce((acc, cur) => {
            const [key, result] = cur;
            const collator = key.args[0].toHuman() as string;
            const exposure = result.toJSON() as {
              total: number | string;
              nominators: { value: number | string; who: string }[];
            };
            return {
              ...acc,
              [collator]: {
                totalStakedPower: BigInt(exposure.total),
                nominators: exposure.nominators.map(({ value, who }) => ({ address: who, stakedPower: BigInt(value) })),
              },
            };
          }, {})
        );
      })
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsCollatorNominatorsInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // collator last session blocks
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking
      .rewardPoints((points: Codec) => {
        const [_, collatorPoints] = points.toJSON() as [number, { [address: string]: number }]; // [totalPoint, { collator: collatorPoint }]
        const staticNumber = 20; // this staticNumber = 20 was given by the backend

        setCollatorLastSessionBlocks(
          Object.keys(collatorPoints).reduce((acc, cur) => {
            const collatorPoint = collatorPoints[cur];
            const blocks = collatorPoint / staticNumber;
            return { ...acc, [cur]: blocks };
          }, {})
        );
      })
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsCollatorLastSessionBlocksInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // ring pool
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking
      .ringPool((value: Balance) => setRingPool(value.toBigInt()))
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsRingPoolInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // kton pool
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking
      .ktonPool((value: Balance) => setKtonPool(value.toBigInt()))
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsKtonPoolInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // deposits (every block)
  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && polkadotApi && blockTimestamp) {
      sub$$ = from(polkadotApi.query.deposit.deposits(address) as Promise<Option<Vec<DepositCodec>>>).subscribe({
        next: (depositsOpt) => {
          if (depositsOpt.isSome) {
            setDeposits(
              depositsOpt.unwrap().map((item) => {
                const startTime = item.startTime.toNumber();
                const expiredTime = item.expiredTime.toNumber();
                const depositRing = item.value.toBigInt();

                return {
                  id: item.id.toNumber(),
                  startTime,
                  accountId: address,
                  reward: calcKtonReward(depositRing, calcMonths(startTime, expiredTime)),
                  expiredTime,
                  value: depositRing,
                  canEarlyWithdraw: blockTimestamp < expiredTime,
                  inUse: item.inUse.isTrue,
                };
              })
            );
          } else {
            setDeposits([]);
          }
        },
        error: console.error,
        complete: () => setIsDepositsInitialized(true),
      });
    } else {
      setDeposits([]);
    }

    return () => sub$$?.unsubscribe();
  }, [address, polkadotApi, blockTimestamp]);

  // ledgers
  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && polkadotApi) {
      const { secondsPerBlock } = getChainConfig(activeChain);

      sub$$ = from(
        polkadotApi.query.darwiniaStaking.ledgers(address) as Promise<Option<DarwiniaStakingLedger>>
      ).subscribe({
        next: (ledgerOpt) => {
          if (ledgerOpt.isSome) {
            const ledgerData = ledgerOpt.unwrap().toJSON() as unknown as DarwiniaStakingLedger;
            const now = Date.now();

            const _unbondingDeposits = (ledgerData.unstakingRing || []).map(([depositId, lastBlockNumber]) => {
              const blocksLeft = lastBlockNumber - blockNumber;
              const secondsLeft = blocksLeft * secondsPerBlock;

              return {
                depositId,
                amount: deposits.find(({ id }) => id === depositId)?.value || 0n,
                expiredAtBlock: lastBlockNumber,
                isExpired: blockNumber >= lastBlockNumber,
                expiredTimestamp: now + secondsLeft * 1000,
              };
            });

            const _unbondingRing = (ledgerData.unstakingRing || []).map(([amount, lastBlockNumber]) => {
              const blocksLeft = lastBlockNumber - blockNumber;
              const secondsLeft = blocksLeft * secondsPerBlock;

              return {
                amount: BigInt(amount),
                expiredAtBlock: lastBlockNumber,
                isExpired: blockNumber >= lastBlockNumber,
                expiredTimestamp: now + secondsLeft * 1000,
              };
            });

            const _unbondingKton = (ledgerData.unstakingKton || []).map(([amount, lastBlockNumber]) => {
              const blocksLeft = lastBlockNumber - blockNumber;
              const secondsLeft = blocksLeft * secondsPerBlock;

              return {
                amount: BigInt(amount),
                expiredAtBlock: lastBlockNumber,
                isExpired: blockNumber >= lastBlockNumber,
                expiredTimestamp: now + secondsLeft * 1000,
              };
            });

            setTotalOfDepositsInStaking(
              deposits
                .filter(({ id }) => ledgerData.stakedDeposits?.includes(id))
                .reduce((acc, cur) => acc + cur.value, 0n)
            );
            setStakedDeposits(ledgerData.stakedDeposits || []);

            setStakedRing(BigInt(ledgerData.stakedRing));
            setStakedKton(BigInt(ledgerData.stakedKton));

            setUnbondingRing(_unbondingRing);
            setUnbondingKton(_unbondingKton);
            setUnbondingDeposits(_unbondingDeposits);
          } else {
            setTotalOfDepositsInStaking(0n);
            setStakedDeposits([]);
            setStakedRing(0n);
            setStakedKton(0n);
            setUnbondingRing([]);
            setUnbondingKton([]);
            setUnbondingDeposits([]);
          }
        },
        error: console.error,
        complete: () => setIsLedgersInitialized(true),
      });
    } else {
      setTotalOfDepositsInStaking(0n);
      setStakedDeposits([]);
      setStakedRing(0n);
      setStakedKton(0n);
      setUnbondingRing([]);
      setUnbondingKton([]);
      setUnbondingDeposits([]);
    }

    return () => sub$$?.unsubscribe();
  }, [address, deposits, polkadotApi, activeChain, blockNumber]);

  // nominator's collator
  useEffect(() => {
    const sub$$ = updateNominatorCollators();
    return () => sub$$.unsubscribe();
  }, [updateNominatorCollators]);

  // collator commission
  useEffect(() => {
    const sub$$ = updateCollatorCommission();
    return () => sub$$.unsubscribe();
  }, [updateCollatorCommission]);

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
        totalOfDepositsInStaking,
        activeCollators,
        collatorCommission,
        collatorLastSessionBlocks,
        collatorNominators,
        nominatorCollators,
        unbondingRing,
        unbondingKton,
        unbondingDeposits,
        minimumDeposit,

        isLedgersInitialized,
        isDepositsInitialized,
        isRingPoolInitialized,
        isKtonPoolInitialized,
        isActiveCollatorsInitialized,
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
