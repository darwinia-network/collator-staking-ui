import { useEffect, useState } from "react";
import {
  AssetBalance,
  UnSubscription,
  FrameSystemAccountInfo,
  PalletAssetsAssetAccountEncoded,
  PalletAssetsAssetAccount,
} from "../types";
import { BN_ZERO } from "../config";
import { ApiPromise } from "@polkadot/api";
import { BigNumber } from "ethers";
import { Option } from "@polkadot/types";

const ktonId = 1026; // this is constant already set on the chain

export const useBalance = (polkadotApi: ApiPromise | undefined, address: string | null | undefined) => {
  const [balance, setBalance] = useState<AssetBalance>({
    kton: BN_ZERO,
    ring: BN_ZERO,
  });

  // subscribe to RING balance updates
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (address && polkadotApi) {
      polkadotApi.query.system
        .account(address, (accountInfo: FrameSystemAccountInfo) => {
          setBalance((prev) => {
            return {
              ...prev,
              ring: BigNumber.from(accountInfo.data.free.toString()),
            };
          });
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi, address]);

  // subscribe to KTON balance updates
  useEffect(() => {
    let unsubscription: UnSubscription = () => undefined;

    if (polkadotApi && address) {
      polkadotApi.query.assets
        .account(ktonId, address, (result: Option<PalletAssetsAssetAccountEncoded>) => {
          if (result.isSome) {
            const { balance } = result.unwrap().toJSON() as unknown as PalletAssetsAssetAccount;
            setBalance((prev) => {
              return {
                ...prev,
                kton: BigNumber.from(balance),
              };
            });
          } else {
            setBalance((prev) => {
              return {
                ...prev,
                kton: BN_ZERO,
              };
            });
          }
        })
        .then((unsub) => (unsubscription = unsub as unknown as UnSubscription))
        .catch(console.error);
    }

    return () => {
      unsubscription();
    };
  }, [polkadotApi, address]);

  return { balance };
};
