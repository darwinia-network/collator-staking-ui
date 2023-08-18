import { useCallback, useState } from "react";
import { useApi } from "./use-api";
import { EMPTY, from } from "rxjs";

interface DefaultValue {
  collatorCommission: { [collator: string]: string | undefined };
  isCollatorCommissionInitialized: boolean;
  isCollatorCommissionLoading: boolean;
}

export const useCollatorCommission = (defaultValue: DefaultValue) => {
  const [collatorCommission, setCollatorCommission] = useState(defaultValue.collatorCommission);
  const [isCollatorCommissionInitialized, setIsCollatorCommissionInitialized] = useState(false);
  const [isCollatorCommissionLoading, setIsCollatorCommissionLoading] = useState(false);

  const { polkadotApi } = useApi();

  const updateCollatorCommission = useCallback(() => {
    if (polkadotApi) {
      setIsCollatorCommissionLoading(true);

      return from(polkadotApi.query.darwiniaStaking.collators.entries()).subscribe({
        next: (entries) =>
          setCollatorCommission(
            entries.reduce((acc, cur) => {
              const [key, result] = cur;
              const collator = key.args[0].toHuman() as string;
              const commission = `${result.toHuman()}`;
              return { ...acc, [collator]: commission };
            }, {})
          ),
        error: console.error,
        complete: () => {
          setIsCollatorCommissionInitialized(true);
          setIsCollatorCommissionLoading(false);
        },
      });
    } else {
      setCollatorCommission({});
      return EMPTY.subscribe();
    }
  }, [polkadotApi]);

  return { collatorCommission, isCollatorCommissionInitialized, isCollatorCommissionLoading, updateCollatorCommission };
};
