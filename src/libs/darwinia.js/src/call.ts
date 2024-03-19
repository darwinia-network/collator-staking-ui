import { Metadata } from "@polkadot/types";
import { camelToSnakeCase } from "./utils";
import { encodeCall, getCallMeta } from "./helpers";
import { PublicClient, WalletClient, sendTransaction } from "@wagmi/core";
import { Hex, concat, toHex } from "viem";

async function doDispatch(publicClient: PublicClient, walletClient: WalletClient, data: Hex | Uint8Array) {
  const contractAddress = "0x0000000000000000000000000000000000000401" as const;

  const tx = {
    account: walletClient.account.address,
    data: toHex(data),
    to: contractAddress,
  };

  await publicClient.call(tx);
  const { hash } = await sendTransaction(tx);
  return publicClient.waitForTransactionReceipt({ hash });
}

export function dispatch(publicClient: PublicClient, metadata: Metadata) {
  return async (walletClient: WalletClient, palletName: string, callName: string, argsEncoded: boolean, args?: any) => {
    let callData: Uint8Array | Hex;
    if (argsEncoded) {
      const { callIndex } = getCallMeta(metadata, palletName, camelToSnakeCase(callName));
      callData = concat([callIndex, args]);
    } else {
      callData = encodeCall(metadata, palletName, callName, args);
    }

    return doDispatch(publicClient, walletClient, callData);
  };
}

export type Dispatch = ReturnType<typeof dispatch>;
