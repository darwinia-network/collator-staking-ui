import { useEffect, useRef, useState } from "react";
import {
  AssetDistribution,
  DarwiniaStakingLedger,
  DarwiniaStakingLedgerEncoded,
  Deposit,
  DepositEncoded,
  PalletAssetsAssetAccount,
  PalletAssetsAssetAccountEncoded,
  StakingAsset,
  UnbondingAsset,
} from "../types";
import { Option, Vec } from "@polkadot/types";
import { BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { useBlock } from "./block";
import { calcKtonFromRingDeposit, getMonthsRange, secondsToHumanTime } from "../utils";
import { BN_ZERO } from "../config";

type UnSubscription = () => void;

interface Params {
  apiPromise: ApiPromise | undefined;
  activeAccount: string | null | undefined;
  secondsPerBlock: number | undefined;
}

/* seconds per block = 12 is the constant time given by the backend */
export const useLedger = ({ apiPromise, activeAccount, secondsPerBlock = 12 }: Params) => {
  /*This is the total amount of RING and KTON that the user has invested in staking, it will be used in calculating
   * the total power that he has*/
  const [stakingAsset, setStakingAsset] = useState<StakingAsset>({ ring: BN_ZERO, kton: BN_ZERO });
  const [isLoadingLedger, setLoadingLedger] = useState<boolean>(true);
  const isInitialLoad = useRef<boolean>(true);
  /*These are all the deposits that have been made by the user*/
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  /*These are the IDs of the deposits that have been used in staking already, BUT DOESN'T
   * include the deposits IDs that are in unbonding/unstaking stake */
  const [stakedDepositsIds, setStakedDepositsIds] = useState<number[]>([]);
  /*staking asset distribution*/
  const [stakedAssetDistribution, setStakedAssetDistribution] = useState<AssetDistribution>();
  const [ktonBalance, setKtonBalance] = useState<BigNumber>(BN_ZERO);
  const { currentBlock } = useBlock(apiPromise);
  const ktonId = 1026; // this is constant already set on the chain

  /*Get staking ledger and deposits. The data that comes back from the server needs a lot of decoding,
   * This useEffect will run on every new block */
  useEffect(() => {
    let depositsUnsubscription: UnSubscription | undefined;
    let ledgerUnsubscription: UnSubscription | undefined;
    let ktonBalanceUnsubscription: UnSubscription | undefined;
    const getStakingLedgerAndDeposits = async () => {
      if (!activeAccount || !apiPromise || !currentBlock) {
        return;
      }
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        setLoadingLedger(true);
      }

      let ledgerInfo: Option<DarwiniaStakingLedgerEncoded> | undefined;
      let depositsInfo: Option<Vec<DepositEncoded>> | undefined;
      let ktonAsset: Option<PalletAssetsAssetAccountEncoded> | undefined;

      /*This method will be called every time there are changes in the deposits or ledger, it is managed by
       * socket */
      const parseData = (
        ledgerOption: Option<DarwiniaStakingLedgerEncoded> | undefined,
        depositsOption: Option<Vec<DepositEncoded>> | undefined,
        ktonAssetOption: Option<PalletAssetsAssetAccountEncoded> | undefined
      ) => {
        if (!ledgerOption || !depositsOption || !ktonAssetOption) {
          return;
        }

        const depositsList: Deposit[] = [];

        if (depositsOption.isSome) {
          const unwrappedDeposits = depositsOption.unwrap();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const depositsData = unwrappedDeposits.toHuman() as Deposit[];
          /*depositsData here is not a real Deposit[], it's just a casting hack */
          depositsData.forEach((item) => {
            const startTime = Number(item.startTime.toString().replaceAll(",", ""));
            const expiredTime = Number(item.expiredTime.toString().replaceAll(",", ""));
            // canWithdraw (canClaim) = item.expiredTime <= now
            const hasExpireTimeReached = currentBlock.timestamp >= expiredTime;
            const canEarlyWithdraw = !hasExpireTimeReached;

            const ringAmount = BigNumber.from(item.value.toString().replaceAll(",", ""));

            /* Calculate the total kton that has been rewarded from every deposit */
            const reward = calcKtonFromRingDeposit(ringAmount, getMonthsRange(startTime, expiredTime));

            depositsList.push({
              id: Number(item.id.toString().replaceAll(",", "")),
              startTime: startTime,
              accountId: activeAccount,
              reward,
              expiredTime: expiredTime,
              value: ringAmount,
              canEarlyWithdraw: canEarlyWithdraw,
              inUse: item.inUse,
            });
          });
        }

        setDeposits(depositsList);

        if (ledgerOption.isSome) {
          const unwrappedLedger = ledgerOption.unwrap();
          /*ledgerData here is not a real DarwiniaStakingLedger, it's just a casting hack */
          const ledgerData = unwrappedLedger.toHuman() as unknown as DarwiniaStakingLedger;

          /*These are the IDs of the deposits that have been used in staking*/
          const stakedDepositsIdsList: number[] = [];
          unwrappedLedger.stakedDeposits?.forEach((item) => {
            stakedDepositsIdsList.push(Number(item.toString().replaceAll(",", "")));
          });

          ledgerData.stakedRing = BigNumber.from(ledgerData.stakedRing.toString().replaceAll(",", ""));
          ledgerData.stakedKton = BigNumber.from(ledgerData.stakedKton.toString().replaceAll(",", ""));
          ledgerData.stakedDeposits = [...stakedDepositsIdsList];
          ledgerData.unstakingDeposits =
            ledgerData.unstakingDeposits?.map((item) => {
              return [Number(item[0].toString().replaceAll(",", "")), Number(item[1].toString().replaceAll(",", ""))];
            }) ?? [];
          ledgerData.unstakingRing =
            ledgerData.unstakingRing?.map((item) => {
              return [Number(item[0].toString().replaceAll(",", "")), Number(item[1].toString().replaceAll(",", ""))];
            }) ?? [];
          ledgerData.unstakingKton =
            ledgerData.unstakingKton?.map((item) => {
              return [Number(item[0].toString().replaceAll(",", "")), Number(item[1].toString().replaceAll(",", ""))];
            }) ?? [];

          // find deposits that have been used in staking by their IDs
          const stakedDepositsList = depositsList.filter((deposit) => stakedDepositsIdsList.includes(deposit.id));
          const totalOfDepositsInStaking = stakedDepositsList.reduce((acc, deposit) => acc.add(deposit.value), BN_ZERO);
          const unbondingDeposits: UnbondingAsset[] = [];
          ledgerData.unstakingDeposits.forEach(([depositId, lastBlockNumber]) => {
            const depositAmount = depositsList.find((item) => item.id === depositId)?.value ?? BN_ZERO;
            const blocksLeft = lastBlockNumber - currentBlock.number;
            const secondsLeft = blocksLeft * secondsPerBlock;
            const humanTime = secondsToHumanTime(secondsLeft);
            unbondingDeposits.push({
              depositId: depositId,
              amount: depositAmount,
              expiredAtBlock: lastBlockNumber,
              isExpired: currentBlock.number >= lastBlockNumber,
              expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
            });
          });

          const unbondingRing: UnbondingAsset[] = [];
          ledgerData.unstakingRing.forEach(([amount, lastBlockNumber]) => {
            const blocksLeft = lastBlockNumber - currentBlock.number;
            const secondsLeft = blocksLeft * secondsPerBlock;
            const humanTime = secondsToHumanTime(secondsLeft);
            unbondingRing.push({
              amount: BigNumber.from(amount),
              expiredAtBlock: lastBlockNumber,
              isExpired: currentBlock.number >= lastBlockNumber,
              expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
            });
          });

          const unbondingKton: UnbondingAsset[] = [];
          ledgerData.unstakingKton.forEach(([amount, lastBlockNumber]) => {
            const blocksLeft = lastBlockNumber - currentBlock.number;
            const secondsLeft = blocksLeft > 0 ? blocksLeft * secondsPerBlock : 0;
            const humanTime = secondsToHumanTime(secondsLeft);
            unbondingKton.push({
              amount: BigNumber.from(amount),
              expiredAtBlock: lastBlockNumber,
              isExpired: currentBlock.number >= lastBlockNumber,
              expiredHumanTime: `${humanTime.time} ${humanTime.unit}`,
            });
          });

          setStakedAssetDistribution({
            ring: {
              bonded: ledgerData.stakedRing,
              totalOfDepositsInStaking: totalOfDepositsInStaking,
              unbondingDeposits: unbondingDeposits,
              unbondingRing: unbondingRing,
            },
            kton: {
              bonded: ledgerData.stakedKton,
              unbondingKton: unbondingKton,
            },
          });

          const totalRingInStaking = ledgerData.stakedRing.add(totalOfDepositsInStaking);
          const totalKtonInStaking = ledgerData.stakedKton;
          setStakingAsset({
            ring: totalRingInStaking,
            kton: totalKtonInStaking,
          });

          setStakedDepositsIds(stakedDepositsIdsList);
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
          setStakingAsset({ ring: BN_ZERO, kton: BN_ZERO });
          setStakedDepositsIds([]);
        }

        /*This is the kton amount that will be used to display the kton balance, and
         * will also in storageProvider to create the account balance (AssetBalance)  */
        if (ktonAssetOption.isSome) {
          const unwrappedKtonAsset = ktonAssetOption.unwrap();
          const ktonAsset = unwrappedKtonAsset.toHuman() as unknown as PalletAssetsAssetAccount;
          const balance = BigNumber.from(ktonAsset.balance.toString().replaceAll(",", ""));
          setKtonBalance(balance);
        } else {
          setKtonBalance(BN_ZERO);
        }
        setLoadingLedger(false);
      };

      ledgerUnsubscription = (await apiPromise.query.darwiniaStaking.ledgers(
        activeAccount,
        (ledger: Option<DarwiniaStakingLedgerEncoded>) => {
          ledgerInfo = ledger;
          parseData(ledgerInfo, depositsInfo, ktonAsset);
        }
      )) as unknown as UnSubscription;

      depositsUnsubscription = (await apiPromise.query.deposit.deposits(
        activeAccount,
        (deposits: Option<Vec<DepositEncoded>>) => {
          depositsInfo = deposits;
          parseData(ledgerInfo, depositsInfo, ktonAsset);
        }
      )) as unknown as UnSubscription;

      ktonBalanceUnsubscription = (await apiPromise.query.assets.account(
        ktonId,
        activeAccount,
        (result: Option<PalletAssetsAssetAccountEncoded>) => {
          ktonAsset = result;
          parseData(ledgerInfo, depositsInfo, ktonAsset);
        }
      )) as unknown as UnSubscription;
    };
    getStakingLedgerAndDeposits().catch((e) => {
      setLoadingLedger(false);
      console.log(e);
      //ignore
    });

    return () => {
      if (ledgerUnsubscription) {
        ledgerUnsubscription();
      }
      if (depositsUnsubscription) {
        depositsUnsubscription();
      }
      if (ktonBalanceUnsubscription) {
        ktonBalanceUnsubscription();
      }
    };
  }, [apiPromise, activeAccount, currentBlock, secondsPerBlock]);

  return {
    stakingAsset,
    isLoadingLedger,
    deposits,
    stakedDepositsIds,
    stakedAssetDistribution,
    ktonBalance,
  };
};
