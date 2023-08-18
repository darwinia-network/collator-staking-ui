import { useCallback, useState } from "react";
import { useApi } from "./use-api";
import { EMPTY, from } from "rxjs";
import type { Option, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";

interface DefaultValue {
  collatorNominators: { [collator: string]: string[] | undefined };
  isCollatorNominatorsInitialized: boolean;
}

export const useCollatorNominators = (defaultValue: DefaultValue) => {
  const [collatorNominators, setCollatorNominators] = useState(defaultValue.collatorNominators);
  const [isCollatorNominatorsInitialized, setIsCollatorNominatorsInitialized] = useState(false);

  const { polkadotApi } = useApi();

  const updateCollatorNominators = useCallback(() => {
    if (polkadotApi) {
      return from(polkadotApi.query.darwiniaStaking.nominators.entries()).subscribe({
        next: (entries) =>
          setCollatorNominators(
            (entries as [StorageKey<AnyTuple>, Option<Codec>][]).reduce((acc, cur) => {
              const [key, result] = cur;
              const nominator = key.args[0].toHuman() as string;
              if (result.isSome) {
                const collator = result.unwrap().toHuman() as string;
                const nominators = new Set(acc[collator]).add(nominator);
                return { ...acc, [collator]: [...nominators] };
              }
              return acc;
            }, {} as { [collator: string]: string[] | undefined })
          ),
        error: console.error,
        complete: () => {
          setIsCollatorNominatorsInitialized(true);
        },
      });
    } else {
      setCollatorNominators({});
      return EMPTY.subscribe();
    }
  }, [polkadotApi]);

  return { collatorNominators, isCollatorNominatorsInitialized, updateCollatorNominators };
};
