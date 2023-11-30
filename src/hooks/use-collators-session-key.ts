import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import { Subscription, from } from "rxjs";
import type { Option, StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";

interface DefaultValue {
  collatorSessionKey: { [collator: string]: string | undefined };
  isCollatorSessionKeyInitialized: boolean;
}

export const useCollatorSessionKey = (defaultValue: DefaultValue) => {
  const [collatorSessionKey, setSollatorSessionKey] = useState(defaultValue.collatorSessionKey);
  const [isCollatorSessionKeyInitialized, setIsCollatorSessionKeyInitialized] = useState(
    defaultValue.isCollatorSessionKeyInitialized
  );

  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (polkadotApi) {
      sub$$ = from(polkadotApi.query.session.nextKeys.entries()).subscribe({
        next: (entries) => {
          setSollatorSessionKey(
            (entries as [StorageKey<AnyTuple>, Option<Codec>][]).reduce((acc, cur) => {
              const [key, result] = cur;
              const collator = key.args[0].toHuman() as string;
              if (result.isSome) {
                const { aura: sessionKey } = result.unwrap().toHuman() as { aura: string };
                return { ...acc, [collator]: sessionKey };
              }
              return acc;
            }, {} as { [collator: string]: string | undefined })
          );
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          setIsCollatorSessionKeyInitialized(true);
        },
      });
    }

    return () => sub$$?.unsubscribe();
  }, [polkadotApi]);

  return { collatorSessionKey, isCollatorSessionKeyInitialized };
};
