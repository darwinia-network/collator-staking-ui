import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import { Subscription, from } from "rxjs";

export function useIsStakingV2() {
  const [isStakingV2, setIsStakingV2] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (polkadotApi) {
      sub$$ = from(polkadotApi.rpc.state.getRuntimeVersion()).subscribe({
        next: ({ specName, specVersion }) => {
          setIsStakingV2(
            specName.toString() === "Crab2" || (specName.toString() === "Darwinia2" && 6600 < specVersion.toNumber())
          );
        },
        error: (err) => {
          console.error(err);
        },
      });
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [polkadotApi]);

  return isStakingV2;
}
