import { useEffect, useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { UnSubscription } from "../types";

interface CurrentBlock {
  number: number;
  timestamp: number;
}

export const useBlock = (polkadotApi: ApiPromise | undefined) => {
  const [currentBlock, setCurrentBlock] = useState<CurrentBlock | undefined>();

  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      polkadotApi.rpc.chain
        .subscribeNewHeads(async (header) => {
          try {
            const timestamp = await polkadotApi.query.timestamp.now();
            setCurrentBlock({
              number: header.number.toNumber(),
              timestamp: Number(timestamp.toString()),
            });
          } catch (e) {
            // ignore
          }
        })
        .then((unsub) => (unsubscription = unsub))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi]);

  return { currentBlock };
};
