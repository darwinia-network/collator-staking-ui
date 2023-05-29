import { pangolinStaticMetadata, buildPangolinCallsClient } from "./pangolin";
import { crabStaticMetadata, buildCrabCallsClient } from "./crab";
import { darwiniaStaticMetadata, buildDarwiniaCallsClient } from "./darwinia";
import { pangoroStaticMetadata, buildPangoroCallsClient } from "./pongoro";

import type { PublicClient } from "@wagmi/core";
import { buildMetadata } from "../src/helpers";

export const clientBuilder = {
  buildPangolinClient: (publicClient: PublicClient) => {
    const metadata = buildMetadata(pangolinStaticMetadata);
    return {
      calls: buildPangolinCallsClient(publicClient, metadata),
    };
  },
  buildPangoroClient: (publicClient: PublicClient) => {
    const metadata = buildMetadata(pangoroStaticMetadata);
    return {
      calls: buildPangoroCallsClient(publicClient, metadata),
    };
  },
  buildCrabClient: (publicClient: PublicClient) => {
    const metadata = buildMetadata(crabStaticMetadata);
    return {
      calls: buildCrabCallsClient(publicClient, metadata),
    };
  },
  buildDarwiniaClient: (publicClient: PublicClient) => {
    const metadata = buildMetadata(darwiniaStaticMetadata);
    return {
      calls: buildDarwiniaCallsClient(publicClient, metadata),
    };
  },
};
