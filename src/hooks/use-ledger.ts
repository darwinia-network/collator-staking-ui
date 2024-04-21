import { DarwiniaStakingLedger, Deposit, UnbondingInfo } from "@/types";
import { useEffect, useState } from "react";
import type { Option } from "@polkadot/types";
import { useAccount } from "wagmi";
import { Subscription, from } from "rxjs";
import { useApi } from "./use-api";
import { useApp } from "./use-app";
import { getChainConfig } from "@/utils";
import { useBlock } from "./use-block";

interface DefaultValue {
  stakedRing: bigint;
  stakedKton: bigint;
  stakedDeposits: number[];
  stakedDeposit: bigint;
  unbondingRing: Omit<UnbondingInfo, "depositId">[];
  unbondingKton: Omit<UnbondingInfo, "depositId">[];
  unbondingDeposits: UnbondingInfo[];
  isLedgersInitialized: boolean;
}

export const useLedger = (deposits: Deposit[], defaultValue: DefaultValue) => {
  const [stakedRing, setStakedRing] = useState(defaultValue.stakedRing);
  const [stakedKton, setStakedKton] = useState(defaultValue.stakedKton);
  const [stakedDeposits, setStakedDeposits] = useState(defaultValue.stakedDeposits);
  const [stakedDeposit, setStakedDeposit] = useState(defaultValue.stakedDeposit);
  const [unbondingRing, setUnbondingRing] = useState(defaultValue.unbondingRing);
  const [unbondingKton, setUnbondingKton] = useState(defaultValue.unbondingKton);
  const [unbondingDeposits, setUnbondingDeposits] = useState(defaultValue.unbondingDeposits);
  const [isLedgersInitialized, setIsLedgersInitialized] = useState(defaultValue.isLedgersInitialized);

  const { address } = useAccount();
  const { polkadotApi } = useApi();
  const { activeChain } = useApp();
  const { blockNumber } = useBlock();

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

            const _unbondingDeposits = (ledgerData.unstakingDeposits || []).map(([depositId, lastBlockNumber]) => {
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

            setStakedDeposit(
              deposits
                .filter(({ id }) => (ledgerData.stakedDeposits || ledgerData.deposits)?.includes(id))
                .reduce((acc, cur) => acc + cur.value, 0n)
            );
            setStakedDeposits(ledgerData.stakedDeposits || ledgerData.deposits || []);

            setStakedRing(BigInt(ledgerData.stakedRing ?? ledgerData.ring ?? 0));
            setStakedKton(0n);

            setUnbondingRing(_unbondingRing);
            setUnbondingKton(_unbondingKton);
            setUnbondingDeposits(_unbondingDeposits);
          } else {
            setStakedDeposit(0n);
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
      setStakedDeposit(0n);
      setStakedDeposits([]);
      setStakedRing(0n);
      setStakedKton(0n);
      setUnbondingRing([]);
      setUnbondingKton([]);
      setUnbondingDeposits([]);
    }

    return () => sub$$?.unsubscribe();
  }, [address, deposits, polkadotApi, activeChain, blockNumber]);

  return {
    stakedRing,
    stakedKton,
    stakedDeposits,
    stakedDeposit,
    unbondingRing,
    unbondingKton,
    unbondingDeposits,
    isLedgersInitialized,
  };
};
