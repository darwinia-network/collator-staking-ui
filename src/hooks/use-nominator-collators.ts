import { useCallback, useState } from "react";
import { useApi } from "./use-api";
import { EMPTY, from } from "rxjs";
import type { Option, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";

interface DefaultValue {
  nominatorCollators: { [nominator: string]: string[] | undefined };
  isNominatorCollatorsInitialized: boolean;
  isNominatorCollatorsLoading: boolean;
}

export const useNominatorCollators = (defaultValue: DefaultValue) => {
  const [nominatorCollators, setNominatorCollators] = useState(defaultValue.nominatorCollators);
  const [isNominatorCollatorsInitialized, setIsNominatorCollatorsInitialized] = useState(false);
  const [isNominatorCollatorsLoading, setIsNominatorCollatorsLoading] = useState(false);

  const { polkadotApi } = useApi();

  const updateNominatorCollators = useCallback(() => {
    if (polkadotApi) {
      setIsNominatorCollatorsLoading(true);

      return from(polkadotApi.query.darwiniaStaking.nominators.entries()).subscribe({
        next: (entries) =>
          setNominatorCollators(
            (entries as [StorageKey<AnyTuple>, Option<Codec>][]).reduce((acc, cur) => {
              const [key, result] = cur;
              const nominator = key.args[0].toHuman() as string;
              if (result.isSome) {
                const collator = result.unwrap().toHuman() as string;
                return { ...acc, [nominator]: [collator] };
              }
              return acc;
            }, {})
          ),
        error: console.error,
        complete: () => {
          setIsNominatorCollatorsInitialized(true);
          setIsNominatorCollatorsLoading(false);
        },
      });
    } else {
      setNominatorCollators({});
      return EMPTY.subscribe();
    }
  }, [polkadotApi]);

  return { nominatorCollators, isNominatorCollatorsInitialized, isNominatorCollatorsLoading, updateNominatorCollators };
};
