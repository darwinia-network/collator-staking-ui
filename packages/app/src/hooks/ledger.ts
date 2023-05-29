import { useEffect, useState } from "react";
import {
  AssetDistribution,
  DarwiniaStakingLedger,
  DarwiniaStakingLedgerEncoded,
  Deposit,
  DepositEncoded,
  StakingAmount,
  UnbondingInfo,
} from "../types";
import { Option, Vec } from "@polkadot/types";
import { BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { useBlock } from "./block";
import { calcKtonFromRingDeposit, getMonthsRange, secondsToHumanTime } from "../utils";
import { BN_ZERO } from "../config";
import { Subscription, from } from "rxjs";

interface Params {
  polkadotApi: ApiPromise | undefined;
  address: string | null | undefined;
  secondsPerBlock: number | undefined;
}

/* seconds per block = 12 is the constant time given by the backend */
export const useLedger = ({ polkadotApi, address, secondsPerBlock = 12 }: Params) => {
  /*This is the total amount of RING and KTON that the user has invested in staking, it will be used in calculating
   * the total power that he has*/
  const [stakingAmount, setStakingAmount] = useState<StakingAmount>({ ring: BN_ZERO, kton: BN_ZERO });
  const [isLedgerLoading, setLedgerLoading] = useState<boolean>(true);
  /*These are all the deposits that have been made by the user*/
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  /*These are the IDs of the deposits that have been used in staking already, BUT DOESN'T
   * include the deposits IDs that are in unbonding/unstaking stake */
  const [stakedDepositsIds, setStakedDepositsIds] = useState<number[]>([]);
  /*staking asset distribution*/
  const [stakedAssetDistribution, setStakedAssetDistribution] = useState<AssetDistribution>();

  const { currentBlock } = useBlock(polkadotApi);

  useEffect(() => {
    let sub$$: Subscription | undefined = undefined;

    if (polkadotApi && address && currentBlock?.number) {
      sub$$ = from(
        polkadotApi.query.darwiniaStaking.ledgers(address) as Promise<Option<DarwiniaStakingLedgerEncoded>>
      ).subscribe({
        next: (ledgerOption) => {
          setLedgerLoading(false);

          if (ledgerOption.isSome) {
            const ledgerData = ledgerOption.unwrap().toJSON() as unknown as DarwiniaStakingLedger;

            const totalOfDepositsInStaking = deposits
              .filter(({ id }) => ledgerData.stakedDeposits?.includes(id))
              .reduce((acc, cur) => acc.add(cur.value), BN_ZERO);

            const unbondingDeposits: UnbondingInfo[] = (ledgerData.unstakingDeposits || []).map(
              ([depositId, lastBlockNumber]) => {
                const blocksLeft = lastBlockNumber - currentBlock.number;
                const secondsLeft = blocksLeft * secondsPerBlock;
                const humanTime = secondsToHumanTime(secondsLeft);
                return {
                  depositId,
                  amount: deposits.find(({ id }) => depositId === id)?.value || BN_ZERO,
                  expiredAtBlock: lastBlockNumber,
                  isExpired: currentBlock.number >= lastBlockNumber,
                  expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
                };
              }
            );

            const unbondingRing: UnbondingInfo[] = (ledgerData.unstakingRing || []).map(([amount, lastBlockNumber]) => {
              const blocksLeft = lastBlockNumber - currentBlock.number;
              const secondsLeft = blocksLeft * secondsPerBlock;
              const humanTime = secondsToHumanTime(secondsLeft);
              return {
                amount: BigNumber.from(amount),
                expiredAtBlock: lastBlockNumber,
                isExpired: currentBlock.number >= lastBlockNumber,
                expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
              };
            });

            const unbondingKton: UnbondingInfo[] = (ledgerData.unstakingKton || []).map(([amount, lastBlockNumber]) => {
              const blocksLeft = lastBlockNumber - currentBlock.number;
              const secondsLeft = blocksLeft > 0 ? blocksLeft * secondsPerBlock : 0;
              const humanTime = secondsToHumanTime(secondsLeft);
              return {
                amount: BigNumber.from(amount),
                expiredAtBlock: lastBlockNumber,
                isExpired: currentBlock.number >= lastBlockNumber,
                expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
              };
            });

            setStakedAssetDistribution({
              ring: {
                bonded: BigNumber.from(ledgerData.stakedRing),
                totalOfDepositsInStaking,
                unbondingDeposits,
                unbondingRing,
              },
              kton: {
                bonded: BigNumber.from(ledgerData.stakedKton),
                unbondingKton,
              },
            });

            const totalRingInStaking = BigNumber.from(ledgerData.stakedRing).add(totalOfDepositsInStaking);
            const totalKtonInStaking = BigNumber.from(ledgerData.stakedKton);
            setStakingAmount({
              ring: totalRingInStaking,
              kton: totalKtonInStaking,
            });

            setStakedDepositsIds(ledgerData.stakedDeposits || []);
          } else {
            setStakedAssetDistribution({
              ring: {
                bonded: BN_ZERO,
                totalOfDepositsInStaking: BN_ZERO,
                unbondingDeposits: [],
                unbondingRing: [],
              },
              kton: {
                bonded: BN_ZERO,
                unbondingKton: [],
              },
            });
            setStakingAmount({ ring: BN_ZERO, kton: BN_ZERO });
            setStakedDepositsIds([]);
          }
        },
        error: (error) => {
          setLedgerLoading(false);

          setStakedAssetDistribution({
            ring: {
              bonded: BN_ZERO,
              totalOfDepositsInStaking: BN_ZERO,
              unbondingDeposits: [],
              unbondingRing: [],
            },
            kton: {
              bonded: BN_ZERO,
              unbondingKton: [],
            },
          });
          setStakingAmount({ ring: BN_ZERO, kton: BN_ZERO });
          setStakedDepositsIds([]);
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [polkadotApi, address, currentBlock?.number, deposits, secondsPerBlock]);

  // get deposits every block
  useEffect(() => {
    let sub$$: Subscription | undefined = undefined;

    if (polkadotApi && address && currentBlock?.timestamp) {
      sub$$ = from(polkadotApi.query.deposit.deposits(address) as Promise<Option<Vec<DepositEncoded>>>).subscribe({
        next: (depositsOption) => {
          if (depositsOption.isSome) {
            setDeposits(
              depositsOption.unwrap().map((item) => {
                const startTime = item.startTime.toNumber();
                const expiredTime = item.expiredTime.toNumber();
                const canEarlyWithdraw = currentBlock.timestamp < expiredTime;
                const ringAmount = BigNumber.from(item.value.toString());

                /* Calculate the total kton that has been rewarded from every deposit */
                const reward = calcKtonFromRingDeposit(ringAmount, getMonthsRange(startTime, expiredTime));

                return {
                  id: item.id.toNumber(),
                  startTime,
                  accountId: address,
                  reward,
                  expiredTime,
                  value: ringAmount,
                  canEarlyWithdraw,
                  inUse: item.inUse.isTrue,
                };
              })
            );
          } else {
            setDeposits([]);
          }
        },
        error: (error) => {
          setDeposits([]);
          console.error(error);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [polkadotApi, address, currentBlock?.timestamp]);

  return {
    stakingAmount,
    isLedgerLoading,
    deposits,
    stakedDepositsIds,
    stakedAssetDistribution,
  };
};
