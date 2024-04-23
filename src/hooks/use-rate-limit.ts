"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "./use-api";
import { isFunction } from "@polkadot/util";
import { forkJoin } from "rxjs";
import type { u128 } from "@polkadot/types";
import { DarwiniaStakingRateLimiter } from "@/types";

const defaultValue = BigInt(Number.MAX_SAFE_INTEGER) * 10n ** 18n; // Token decimals: 18

export function useRateLimit() {
  const [availableWithdraw, setAvailableWithdraw] = useState(defaultValue);
  const [availableDeposit, setAvailableDeposit] = useState(defaultValue);
  const { polkadotApi } = useApi();

  const updateRateLimit = useCallback(() => {
    if (
      isFunction(polkadotApi?.query.darwiniaStaking?.rateLimitState) &&
      isFunction(polkadotApi?.query.darwiniaStaking?.rateLimit)
    ) {
      return forkJoin([
        polkadotApi?.query.darwiniaStaking.rateLimitState() as unknown as Promise<DarwiniaStakingRateLimiter>,
        polkadotApi?.query.darwiniaStaking.rateLimit() as Promise<u128>,
      ]).subscribe({
        next: ([rls, rl]) => {
          const limit = rl.toBigInt();
          if (rls.isPos) {
            const pos = rls.asPos.toBigInt();
            setAvailableWithdraw(limit + pos);
            setAvailableDeposit(limit - pos);
          } else {
            const neg = rls.asNeg.toBigInt();
            setAvailableWithdraw(limit - neg);
            setAvailableDeposit(limit + neg);
          }
        },
        error: (err) => {
          console.error(err);

          setAvailableWithdraw(0n);
          setAvailableDeposit(0n);
        },
      });
    } else {
      setAvailableWithdraw(defaultValue);
      setAvailableDeposit(defaultValue);
    }
  }, [polkadotApi?.query.darwiniaStaking]);

  useEffect(() => {
    const sub$$ = updateRateLimit();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [updateRateLimit]);

  return { availableWithdraw, availableDeposit, updateRateLimit };
}
