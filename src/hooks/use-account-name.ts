import type { DeriveAccountRegistration } from "@polkadot/api-derive/accounts/types";
import type { AccountId } from "@polkadot/types/interfaces";
import { TypeRegistry } from "@polkadot/types/create";
import { stringToU8a } from "@polkadot/util";
import { from, Subscription } from "rxjs";

import { useEffect, useState } from "react";
import { useApi } from "./use-api";

const registry = new TypeRegistry();
const PAD = 32;
const KNOWN: [AccountId, string][] = [
  [registry.createType("AccountId", stringToU8a("modlpy/socie".padEnd(PAD, "\0"))), "Society"],
  [registry.createType("AccountId", stringToU8a("modlpy/trsry".padEnd(PAD, "\0"))), "Treasury"],
];

const extractName = (accountAddress: string, defaultName?: string) => {
  const known = KNOWN.find(([address]) => address.eq(accountAddress));
  if (known) {
    return known[1];
  }
  return defaultName || accountAddress;
};

const extractIdentity = (cacheAddress: string, identity: DeriveAccountRegistration) => {
  const judgements = identity.judgements.filter(([, judgement]) => !judgement.isFeePaid);
  const isGood = judgements.some(([, judgement]) => judgement.isKnownGood || judgement.isReasonable);
  // const isBad = judgements.some(([, judgement]) => judgement.isErroneous || judgement.isLowQuality);
  const displayName = isGood ? identity.display : (identity.display || "").replace(/[^\x20-\x7E]/g, "");
  const displayParent =
    identity.displayParent && (isGood ? identity.displayParent : identity.displayParent.replace(/[^\x20-\x7E]/g, ""));
  return displayParent || displayName || cacheAddress;
};

export const useAccountName = (address: string) => {
  const [accountName, setAccountName] = useState(address);
  const { polkadotApi } = useApi();

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (polkadotApi) {
      sub$$ = from(polkadotApi.derive.accounts.info(address)).subscribe({
        next: (accountInfo) => {
          const { nickname, identity } = accountInfo;
          if (typeof polkadotApi.query.identity?.identityOf === "function") {
            setAccountName(identity.display ? extractIdentity(address, identity) : extractName(address));
          } else if (nickname) {
            setAccountName(nickname);
          } else {
            setAccountName(extractName(address));
          }
        },
        error: console.error,
      });
    }

    return () => sub$$?.unsubscribe();
  }, [address, polkadotApi]);

  return { accountName };
};
