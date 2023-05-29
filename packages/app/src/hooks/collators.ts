import { useEffect, useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { UnSubscription, Collator } from "../types";
import { BigNumber } from "ethers";
import { Option, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";
import { useAccountName } from "././accountName";
import { BN_ZERO } from "../config";

export const useCollators = (polkadotApi: ApiPromise | undefined) => {
  const { getPrettyName } = useAccountName(polkadotApi);

  const [collators, setCollators] = useState<Collator[]>([]);
  const [activeCollators, setActiveCollators] = useState<string[]>([]); // addresses
  const [collatorsStakedPower, setCollatorsStakedPower] = useState<{ [address: string]: BigNumber }>({}); // { address: power }
  const [collatorsNominators, setCollatorsNominators] = useState<{ [address: string]: string[] }>({}); // { collator: nominators }
  const [collatorsLastSessionBlocks, setCollatorsLastSessionBlocks] = useState<{ [address: string]: number }>({}); // { collator: blockNumber }

  // subscribe to update activeCollators
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      polkadotApi.query.session
        .validators((addresses: Codec) => {
          // these are the collators that are active in this session
          setActiveCollators(addresses.toJSON() as string[]);
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi]);

  // subscribe to update collatorsStakedPower
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      /* polkadotApi.query.darwiniaStaking.collators and polkadotApi.query.darwiniaStaking.exposures.entries return almost the same
       * kind of data (both active and waiting collators), but staking.exposures.entries has some other properties
       * that staking.collators doesn't have */
      polkadotApi.query.darwiniaStaking.exposures
        .entries((entries: [StorageKey<AnyTuple>, Codec][]) => {
          /*Get all the collators and the total powers staked to them */
          setCollatorsStakedPower(
            entries.reduce((acc, cur) => {
              const [key, result] = cur;
              const collator = key.args[0].toHuman() as string;
              const exposure = result.toJSON() as {
                total: number;
              };
              return { ...acc, [collator]: BigNumber.from(exposure.total) };
            }, {})
          );
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi]);

  // subscribe to update collatorsNominators
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      polkadotApi.query.darwiniaStaking.nominators
        .entries((entries: [StorageKey<AnyTuple>, Option<Codec>][]) => {
          setCollatorsNominators(
            entries.reduce((acc, cur) => {
              const [key, result] = cur;
              const nominator = key.args[0].toHuman() as string;
              if (result.isSome) {
                const collator = result.unwrap().toHuman() as string;
                return { ...acc, [collator]: [...new Set([...(acc[collator] || []), nominator])] };
              }
              return acc;
            }, {} as { [address: string]: string[] })
          );
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi]);

  // subscribe to update collatorsLastSessionBlocks
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      polkadotApi.query.darwiniaStaking
        .rewardPoints((points: Codec) => {
          const rewardPoints = points.toJSON() as [number, { [address: string]: number }]; // [totalPoint, { collator: collatorPoint }]
          if (rewardPoints.length >= 2) {
            const collatorsPoints = rewardPoints[1];
            setCollatorsLastSessionBlocks(
              Object.keys(collatorsPoints).reduce((acc, cur) => {
                const collatorPoints = collatorsPoints[cur];
                const staticNumber = 20; // this staticNumber = 20 was given by the backend
                const blocksNumber = collatorPoints / staticNumber;
                return { ...acc, [cur]: blocksNumber };
              }, {})
            );
          }
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi]);

  // subscribe to update collators
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      /* polkadotApi.query.darwiniaStaking.collators and polkadotApi.query.darwiniaStaking.exposures.entries return almost the same
       * kind of data (both active and waiting collators), the ONLY difference is that staking.collators contains commission percentage which staking.exposures.entries
       * doesn't. Here we have to call staking.collators since we need commission percentage */
      polkadotApi.query.darwiniaStaking.collators
        .entries(async (entries: [StorageKey<AnyTuple>, Codec][]) => {
          const allCollators = [];
          for (const entry of entries) {
            const [key, result] = entry;
            const accountAddress = key.args[0].toHuman() as string;
            allCollators.push({
              id: accountAddress,
              accountAddress: accountAddress,
              isActive: activeCollators.includes(accountAddress),
              lastSessionBlocks: collatorsLastSessionBlocks[accountAddress] ?? 0,
              commission: `${result.toHuman()}`,
              totalStaked: collatorsStakedPower[accountAddress] ?? BN_ZERO,
              accountName: await getPrettyName(accountAddress),
              nominators: collatorsNominators[accountAddress] ?? [],
            });
          }

          setCollators(allCollators);
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [
    polkadotApi,
    activeCollators,
    collatorsLastSessionBlocks,
    collatorsNominators,
    collatorsStakedPower,
    getPrettyName,
  ]);

  return { collators };
};
