"use client";

import { useEffect, useState } from "react";
import type { Codec } from "@polkadot/types-codec/types";
import { useApi } from "./use-api";

export const useBlock = () => {
  const [blockTimestamp, setBlockTimestamp] = useState(0);
  const [blockNumber, setBlockNumber] = useState(0);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let unsub = () => undefined;

    if (polkadotApi) {
      polkadotApi.query.timestamp
        .now((moment: Codec) => setBlockTimestamp(Number(moment.toString())))
        .then((_unsub) => (unsub = _unsub as unknown as typeof unsub))
        .catch(console.error);
    } else {
      setBlockTimestamp(0);
    }

    return () => unsub();
  }, [polkadotApi]);

  useEffect(() => {
    let unsub = () => undefined;

    if (polkadotApi) {
      polkadotApi.rpc.chain
        .subscribeNewHeads((header) => setBlockNumber(header.number.toNumber()))
        .then((_unsub) => (unsub = _unsub as typeof unsub))
        .catch(console.error);
    } else {
      setBlockNumber(0);
    }

    return () => unsub();
  }, [polkadotApi]);

  return { blockNumber, blockTimestamp };
};
