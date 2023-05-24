import { useEffect, useRef, useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { Collator } from "../types";
import { BigNumber } from "ethers";
import { Option, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";
import { useAccountName } from "././accountName";
import { useBlock } from "./block";
import { BN_ZERO } from "../config";

type UnSubscription = () => void;

export const useCollators = (apiPromise: ApiPromise | undefined) => {
  const [collators, setCollators] = useState<Collator[]>([]);
  const { currentBlock } = useBlock(apiPromise);
  const { getPrettyName } = useAccountName(apiPromise);
  /*allCollatorsStakedPowersMap contains all the collators with their total powers*/
  const allCollatorsStakedPowersMap = useRef<Map<string, BigNumber>>(new Map<string, BigNumber>());
  const allCollatorsNominatorsMap = useRef<Map<string, string[]>>(new Map<string, string[]>());
  /*Calculate collators' last session blocks */
  const allCollatorsLastSessionBlocksMap = useRef<Map<string, number>>(new Map<string, number>());
  const activeCollatorsAddresses = useRef<string[]>([]);

  useEffect(() => {
    let exposureUnsubscription: UnSubscription | undefined;
    let collatorsUnsubscription: UnSubscription | undefined;
    let rewardsUnsubscription: UnSubscription | undefined;
    let allCollatorUnsubscription: UnSubscription | undefined;
    let nominatorsUnsubscription: UnSubscription | undefined;

    const listenToCollators = async () => {
      if (!apiPromise) {
        return;
      }

      const updateCollators = async () => {
        if (allCollatorUnsubscription) {
          allCollatorUnsubscription();
        }

        /* apiPromise.query.darwiniaStaking.collators and apiPromise.query.darwiniaStaking.exposures.entries return almost the same
         * kind of data (both active and waiting collators), the ONLY difference is that staking.collators contains commission percentage which staking.exposures.entries
         * doesn't. Here we have to call staking.collators since we need commission percentage */
        allCollatorUnsubscription = (await apiPromise.query.darwiniaStaking.collators.entries(
          async (allCollatorEntries: [StorageKey<AnyTuple>, Codec][]) => {
            const allCollators = [];
            for (let i = 0; i < allCollatorEntries.length; i++) {
              const [key, result] = allCollatorEntries[i];
              const accountAddress = key.args.map((item) => item.toHuman())[0] as unknown as string;
              const commission = `${result.toHuman()}`;
              const totalStaked = allCollatorsStakedPowersMap.current.get(accountAddress) ?? BN_ZERO;
              const blocksLastSession = allCollatorsLastSessionBlocksMap.current.get(accountAddress) ?? 0;
              const nominators = allCollatorsNominatorsMap.current.get(accountAddress) ?? [];

              const prettyName = await getPrettyName(accountAddress);

              const collator: Collator = {
                id: accountAddress,
                accountAddress: accountAddress,
                isActive: activeCollatorsAddresses.current.includes(accountAddress),
                lastSessionBlocks: blocksLastSession,
                commission: commission,
                totalStaked: totalStaked,
                accountName: prettyName,
                nominators: nominators,
              };
              allCollators.push(collator);
            }

            setCollators(allCollators);
          }
        )) as unknown as UnSubscription;
      };

      nominatorsUnsubscription = (await apiPromise.query.darwiniaStaking.nominators.entries(
        (nominatorsEntries: [StorageKey<AnyTuple>, Option<Codec>][]) => {
          allCollatorsNominatorsMap.current.clear();
          nominatorsEntries.forEach(([key, result]) => {
            const nominator = key.args.map((item) => item.toHuman())[0] as unknown as string;
            if (result.isSome) {
              const collator = result.unwrap().toHuman() as unknown as string;
              const previousNominators = allCollatorsNominatorsMap.current.get(collator) ?? [];
              allCollatorsNominatorsMap.current.set(collator, [...new Set([...previousNominators, nominator])]);
            }
          });

          updateCollators();
        }
      )) as unknown as UnSubscription;

      /* apiPromise.query.darwiniaStaking.collators and apiPromise.query.darwiniaStaking.exposures.entries return almost the same
       * kind of data (both active and waiting collators), but staking.exposures.entries has some other properties
       * that staking.collators doesn't have */
      exposureUnsubscription = (await apiPromise.query.darwiniaStaking.exposures.entries(
        (exposureEntries: [StorageKey<AnyTuple>, Codec][]) => {
          allCollatorsStakedPowersMap.current.clear();
          /*Get all the collators and the total powers staked to them */
          exposureEntries.forEach(([key, result]) => {
            const accountAddress = key.args.map((item) => item.toHuman())[0] as unknown as string;
            const exposureObj = result.toHuman() as unknown as {
              total: string;
            };
            allCollatorsStakedPowersMap.current.set(
              accountAddress,
              BigNumber.from(exposureObj.total.toString().replaceAll(",", ""))
            );
          });

          updateCollators();
        }
      )) as unknown as UnSubscription;

      collatorsUnsubscription = (await apiPromise.query.session.validators((activeCollatorsAddressesEncoded: Codec) => {
        /*These are the collators that are active in this session */
        activeCollatorsAddresses.current = activeCollatorsAddressesEncoded.toHuman() as unknown as string[];

        updateCollators();
      })) as unknown as UnSubscription;

      rewardsUnsubscription = (await apiPromise.query.darwiniaStaking.rewardPoints((rewardPointsEncoded: Codec) => {
        const rewardPoints = rewardPointsEncoded.toHuman() as unknown as [string, { [key: string]: string }];
        if (rewardPoints.length >= 2) {
          const collatorsPoints = rewardPoints[1];
          allCollatorsLastSessionBlocksMap.current.clear();
          Object.keys(collatorsPoints).forEach((key) => {
            const singleCollatorPoints = Number(collatorsPoints[key].toString().replaceAll(",", ""));
            /*This staticNumber = 20 was given by the backend */
            const staticNumber = 20;
            const blocksNumber = singleCollatorPoints / staticNumber;
            allCollatorsLastSessionBlocksMap.current.set(key, blocksNumber);
          });

          updateCollators();
        }
      })) as unknown as UnSubscription;
    };

    listenToCollators().catch((e) => {
      // console.log(e);
      //ignore
    });
    return () => {
      if (exposureUnsubscription) {
        exposureUnsubscription();
      }
      if (collatorsUnsubscription) {
        collatorsUnsubscription();
      }
      if (rewardsUnsubscription) {
        rewardsUnsubscription();
      }
      if (allCollatorUnsubscription) {
        allCollatorUnsubscription();
      }
      if (nominatorsUnsubscription) {
        nominatorsUnsubscription();
      }
    };
  }, [apiPromise, currentBlock?.number, getPrettyName]);

  return {
    collators,
  };
};
