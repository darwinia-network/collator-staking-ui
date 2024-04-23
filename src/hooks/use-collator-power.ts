import { useEffect, useState } from "react";
import { from, of, forkJoin, switchMap, Subscription } from "rxjs";
import { useApi } from "./use-api";
import { DarwiniaStakingLedger } from "@/types";

interface DepositJson {
  id: number;
  value: string;
  startTime: number;
  expiredTime: number;
  inUse: boolean;
}

interface ExposuresJson {
  nominators: { who: string; vote: string }[];
  vote: string;
}

interface DefaultValue {
  collatorPower: { [collator: string]: bigint | undefined };
  isCollatorPowerInitialized: boolean;
}

type ExposureCacheState = "Previous" | "Current" | "Next";

export const useCollatorPower = (
  collatorNominators: { [collator: string]: string[] | undefined },
  defaultValue: DefaultValue
) => {
  const [collatorPower, setCollatorPower] = useState(defaultValue.collatorPower);
  const [isCollatorPowerInitialized, setIsCollatorPowerInitialized] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (polkadotApi) {
      sub$$ = from(polkadotApi.query.darwiniaStaking.exposureCacheStates())
        .pipe(
          switchMap((cacheStates) => {
            const index = (cacheStates.toJSON() as ExposureCacheState[]).findIndex((cs) => cs === "Current");
            const exposureCache = [
              polkadotApi.query.darwiniaStaking.exposureCache0,
              polkadotApi.query.darwiniaStaking.exposureCache1,
              polkadotApi.query.darwiniaStaking.exposureCache2,
            ].at(index);

            return forkJoin([
              exposureCache ? exposureCache.entries() : of([]),
              polkadotApi.query.darwiniaStaking.ledgers.entries(),
              polkadotApi.query.deposit.deposits.entries(),
            ]);
          })
        )
        .subscribe({
          next: ([exposures, ledgers, deposits]) => {
            const parsedExposures = exposures.reduce((acc, cur) => {
              const address = (cur[0].toHuman() as string[])[0];
              const data = cur[1].toJSON() as unknown as ExposuresJson;
              return { ...acc, [address]: data };
            }, {} as { [address: string]: ExposuresJson | undefined });

            const parsedLedgers = ledgers.reduce((acc, cur) => {
              const address = cur[0].toHuman() as string;
              const data = cur[1].toJSON() as unknown as DarwiniaStakingLedger;
              return { ...acc, [address]: data };
            }, {} as { [address: string]: DarwiniaStakingLedger | undefined });

            const parsedDeposits = deposits.reduce((acc, cur) => {
              const address = cur[0].toHuman() as string;
              const data = cur[1].toJSON() as unknown as DepositJson[];
              return { ...acc, [address]: data };
            }, {} as { [address: string]: DepositJson[] | undefined });

            const collators = Object.keys(collatorNominators);
            setCollatorPower(
              collators.reduce((acc, cur) => {
                if (parsedExposures[cur]) {
                  // active collator
                  return { ...acc, [cur]: BigInt(parsedExposures[cur]?.vote || 0) };
                }

                const nominators = collatorNominators[cur] || [];
                const { stakedDeposit, stakedRing } = nominators.reduce(
                  (acc, cur) => {
                    const ledger = parsedLedgers[cur];
                    const deposits = parsedDeposits[cur] || [];

                    if (ledger) {
                      const stakedDeposit = deposits
                        .filter(({ id }) => (ledger.stakedDeposits || ledger.deposits)?.includes(id))
                        .reduce((acc, cur) => acc + BigInt(cur.value), 0n);

                      return {
                        stakedDeposit: acc.stakedDeposit + stakedDeposit,
                        stakedRing: acc.stakedRing + BigInt(ledger.stakedRing ?? ledger.ring ?? 0n),
                      };
                    }
                    return acc;
                  },
                  { stakedDeposit: 0n, stakedRing: 0n }
                );

                return { ...acc, [cur]: stakedRing + stakedDeposit };
              }, {} as { [collator: string]: bigint | undefined })
            );
          },
          error: console.error,
          complete: () => setIsCollatorPowerInitialized(true),
        });
    } else {
      setCollatorPower({});
    }

    return () => sub$$?.unsubscribe();
  }, [polkadotApi, collatorNominators]);

  return { collatorPower, isCollatorPowerInitialized };
};
