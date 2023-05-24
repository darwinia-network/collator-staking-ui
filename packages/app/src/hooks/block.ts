import { useEffect, useState } from "react";
import { ApiPromise } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

interface CurrentBlock {
  number: number;
  timestamp: number;
}

export const useBlock = (apiPromise: ApiPromise | undefined) => {
  const [currentBlock, setCurrentBlock] = useState<CurrentBlock | undefined>();

  useEffect(() => {
    let unsubscription: (() => void) | undefined;
    const listenToBlocks = async () => {
      if (!apiPromise) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      unsubscription = await apiPromise.rpc.chain.subscribeNewHeads(async (header: Header) => {
        try {
          const timestamp = await apiPromise.query.timestamp.now();
          setCurrentBlock({
            number: header.number.toNumber(),
            timestamp: Number(timestamp.toString()),
          });
        } catch (e) {
          //ignore
        }
      });
    };

    listenToBlocks().catch(() => {
      //ignore
    });
    return () => {
      if (unsubscription) {
        unsubscription();
      }
    };
  }, [apiPromise]);

  return {
    currentBlock,
  };
};
