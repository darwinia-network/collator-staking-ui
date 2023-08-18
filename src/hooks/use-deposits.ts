import { Deposit, DepositCodec } from "@/types";
import { useEffect, useState } from "react";
import { useBlock } from "./use-block";
import { useApi } from "./use-api";
import { useAccount } from "wagmi";
import { Subscription, from } from "rxjs";
import type { Option, Vec } from "@polkadot/types";
import { calcKtonReward, calcMonths } from "@/utils";

interface DefaultValue {
  deposits: Deposit[];
  isDepositsInitialized: boolean;
}

export const useDeposits = (defaultValue: DefaultValue) => {
  const [deposits, setDeposits] = useState(defaultValue.deposits);
  const [isDepositsInitialized, setIsDepositsInitialized] = useState(defaultValue.isDepositsInitialized);

  const { blockTimestamp } = useBlock();
  const { polkadotApi } = useApi();
  const { address } = useAccount();

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

  return { deposits, isDepositsInitialized };
};
