import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import type { Codec } from "@polkadot/types/types";

interface DefaultValue {
  collatorLastSessionBlocks: { [collator: string]: number | undefined };
  isCollatorLastSessionBlocksInitialized: boolean;
}

export const useCollatorLastSessionBlocks = (defaultValue: DefaultValue) => {
  const [collatorLastSessionBlocks, setCollatorLastSessionBlocks] = useState(defaultValue.collatorLastSessionBlocks);
  const [isCollatorLastSessionBlocksInitialized, setIsCollatorLastSessionBlocksInitialized] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let unsub = () => undefined;

    const handle = (points: Codec) => {
      const [_, collatorPoints] = points.toJSON() as [number, { [address: string]: number }]; // [totalPoint, { collator: collatorPoint }]

      setCollatorLastSessionBlocks(
        Object.keys(collatorPoints).reduce((acc, cur) => {
          const collatorPoint = collatorPoints[cur];
          return { ...acc, [cur]: collatorPoint };
        }, {})
      );
    };

    if (polkadotApi?.query.darwiniaStaking.rewardPoints) {
      polkadotApi.query.darwiniaStaking
        .rewardPoints(handle)
        .then((_unsub) => {
          unsub = _unsub as unknown as typeof unsub;
        })
        .catch(console.error)
        .finally(() => setIsCollatorLastSessionBlocksInitialized(true));
    } else if (polkadotApi?.query.darwiniaStaking.authoredBlocksCount) {
      polkadotApi.query.darwiniaStaking
        .authoredBlocksCount(handle)
        .then((_unsub) => {
          unsub = _unsub as unknown as typeof unsub;
        })
        .catch(console.error)
        .finally(() => setIsCollatorLastSessionBlocksInitialized(true));
    } else {
      setCollatorLastSessionBlocks(defaultValue.collatorLastSessionBlocks);
      setIsCollatorLastSessionBlocksInitialized(false);
    }

    return () => unsub();
  }, [polkadotApi, defaultValue]);

  return { collatorLastSessionBlocks, isCollatorLastSessionBlocksInitialized };
};
