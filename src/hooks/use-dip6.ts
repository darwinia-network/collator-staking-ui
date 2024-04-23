"use client";

import { useEffect, useState } from "react";
import { useApi } from "./use-api";
import { isFunction } from "@polkadot/util";

export function useDip6() {
  const [isDip6Implemented, setIsDip6Implemented] = useState(false);
  const { polkadotApi } = useApi();

  useEffect(() => {
    setIsDip6Implemented(isFunction(polkadotApi?.query.darwiniaStaking?.rateLimit));
  }, [polkadotApi?.query.darwiniaStaking?.rateLimit]);

  return { isDip6Implemented };
}
