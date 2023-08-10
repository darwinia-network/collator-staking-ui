import type { PublicClient } from "@wagmi/core";
import type { Metadata } from "@polkadot/types";
import { dispatch as dispatchCall } from "../../../src/call";

import { getUtility } from "./utility";
import { getDarwiniaStaking } from "./darwiniaStaking";
import { getSession } from "./session";

export const buildCrabCallsClient = (publicClient: PublicClient, metadata: Metadata) => {
  const dispatch = dispatchCall(publicClient, metadata);
  return {
    darwiniaStaking: getDarwiniaStaking(dispatch, metadata),
    session: getSession(dispatch, metadata),
    utility: getUtility(dispatch, metadata),
  };
};
