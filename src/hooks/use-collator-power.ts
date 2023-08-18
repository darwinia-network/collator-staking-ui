import { useEffect, useState } from "react";
import { forkJoin, Subscription } from "rxjs";
import { useApi } from "./use-api";
import { DarwiniaStakingLedger } from "@/types";
import { stakingToPower } from "@/utils";

interface DepositJson {
  id: number;
  value: string;
  startTime: number;
  expiredTime: number;
  inUse: boolean;
}

interface ExposuresJson {
  nominators: { who: string; value: string }[];
  total: string;
}

interface DefaultValue {
  collatorPower: { [collator: string]: bigint | undefined };
  isCollatorPowerInitialized: boolean;
}

export const useCollatorPower = (
  collatorNominators: { [collator: string]: string[] | undefined },
  ringPool: bigint,
  ktonPool: bigint,
  defaultValue: DefaultValue
) => {
  const [collatorPower, setCollatorPower] = useState(defaultValue.collatorPower);
  const [isCollatorPowerInitialized, setIsCollatorPowerInitialized] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (polkadotApi) {
      sub$$ = forkJoin([
        polkadotApi.query.darwiniaStaking.exposures.entries(),
        polkadotApi.query.darwiniaStaking.ledgers.entries(),
        polkadotApi.query.deposit.deposits.entries(),
      ]).subscribe({
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
                return { ...acc, [cur]: BigInt(parsedExposures[cur]?.total || 0) };
              }

              const nominators = collatorNominators[cur] || [];
              const power = nominators.reduce((acc, cur) => {
                const ledger = parsedLedgers[cur];
                const deposits = parsedDeposits[cur] || [];

                if (ledger) {
                  const stakedDeposit = deposits
                    .filter(({ id }) => ledger.stakedDeposits?.includes(id))
                    .reduce((acc, cur) => acc + BigInt(cur.value), 0n);
                  return (
                    acc +
                    stakingToPower(
                      BigInt(ledger.stakedRing) + stakedDeposit,
                      BigInt(ledger.stakedKton),
                      ringPool,
                      ktonPool
                    )
                  );
                }
                return acc;
              }, 0n);

              return { ...acc, [cur]: power };
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
  }, [polkadotApi, collatorNominators, ringPool, ktonPool]);

  return { collatorPower, isCollatorPowerInitialized };
};
