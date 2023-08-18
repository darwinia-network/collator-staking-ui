import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import type { Codec } from "@polkadot/types/types";

interface DefaultValue {
  activeCollators: string[];
  isActiveCollatorsInitialized: boolean;
}

export const useActiveCollators = (defaultValue: DefaultValue) => {
  const [activeCollators, setActiveCollators] = useState(defaultValue.activeCollators);
  const [isActiveCollatorsInitialized, setIsActiveCollatorsInitialized] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let unsub = () => undefined;

    polkadotApi?.query.session
      .validators((addresses: Codec) => {
        // these are the collators that are active in this session
        setActiveCollators(addresses.toJSON() as string[]);
      })
      .then((_unsub) => {
        unsub = _unsub as unknown as typeof unsub;
      })
      .catch(console.error)
      .finally(() => setIsActiveCollatorsInitialized(true));

    return () => unsub();
  }, [polkadotApi]);

  return { activeCollators, isActiveCollatorsInitialized };
};
