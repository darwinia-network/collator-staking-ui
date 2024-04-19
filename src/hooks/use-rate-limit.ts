"use client";

import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import { isFunction } from "@polkadot/util";
import { Subscription, forkJoin } from "rxjs";
import type { u128 } from "@polkadot/types";
import { DarwiniaStakingRateLimiter } from "@/types";

type RateLimitState = { pos: bigint; neg?: never } | { pos?: never; neg: bigint };

export function useRateLimit() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState | null>();
  const [rateLimit, setRateLimit] = useState<bigint | null>();
  const [isDip6Implemented, setIsDip6Implemented] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (
      isFunction(polkadotApi?.query.darwiniaStaking?.rateLimitState) &&
      isFunction(polkadotApi?.query.darwiniaStaking?.rateLimit)
    ) {
      setIsDip6Implemented(true);
      sub$$ = forkJoin([
        polkadotApi.query.darwiniaStaking.rateLimitState() as unknown as Promise<DarwiniaStakingRateLimiter>,
        polkadotApi.query.darwiniaStaking.rateLimit() as Promise<u128>,
      ]).subscribe({
        next: ([rls, rl]) => {
          setRateLimitState(rls.isPos ? { pos: rls.asPos.toBigInt() } : { neg: rls.asNeg.toBigInt() });
          setRateLimit(rl.toBigInt());
        },
        error: (err) => {
          console.error(err);
          setRateLimit(null);
          setRateLimitState(null);
        },
      });
    } else {
      setIsDip6Implemented(false);
      setRateLimitState(undefined);
      setRateLimit(undefined);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [polkadotApi?.query.darwiniaStaking]);

  return { rateLimit, rateLimitState, isDip6Implemented };
}
