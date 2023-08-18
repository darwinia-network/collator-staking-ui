import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import type { Balance } from "@polkadot/types/interfaces";

interface DefaultValue {
  ringPool: bigint;
  ktonPool: bigint;
  isRingPoolInitialized: boolean;
  isKtonPoolInitialized: boolean;
}

export const usePool = (defaultValue: DefaultValue) => {
  const [ringPool, setRingPool] = useState(defaultValue.ringPool);
  const [ktonPool, setKtonPool] = useState(defaultValue.ktonPool);
  const [isRingPoolInitialized, setIsRingPoolInitialized] = useState(false);
  const [isKtonPoolInitialized, setIsKtonPoolInitialized] = useState(false);
  const { polkadotApi } = useApi();

  // ring pool
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking
      .ringPool((value: Balance) => setRingPool(value.toBigInt()))
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsRingPoolInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  // kton pool
  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.darwiniaStaking
      .ktonPool((value: Balance) => setKtonPool(value.toBigInt()))
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsKtonPoolInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  return { ringPool, ktonPool, isRingPoolInitialized, isKtonPoolInitialized };
};
