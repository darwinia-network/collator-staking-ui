/**
 * This is the doc comment for pallet `Session`'s calls.
 *
 * `Session`'s storages: {@link: module:pangoro/session/storages}
 *
 * @module pangoro/session/calls
 */
import { Dispatch } from "../../../src/call";
import { buildRuntimeCall, decodeCall } from "../../../src/helpers";
import { Metadata } from "@polkadot/types";
import type { WalletClient } from "@wagmi/core";
import { TransactionReceipt, Hex } from "viem";

export const getSession = (dispatch: Dispatch, metadata: Metadata) => {
  return {
    /**
     * Sets the session key(s) of the function caller to `keys`.
     * Allows an account to set its session key prior to becoming a validator.
     * This doesn't take effect until the next session.
     *
     * The dispatch origin of this function must be signed.
     *
     * # <weight>
     * - Complexity: `O(1)`. Actual cost depends on the number of length of
     *   `T::Keys::key_ids()` which is fixed.
     * - DbReads: `origin account`, `T::ValidatorIdOf`, `NextKeys`
     * - DbWrites: `origin account`, `NextKeys`
     * - DbReads per key id: `KeyOwner`
     * - DbWrites per key id: `KeyOwner`
     * # </weight>
     *
     * @param {unknown} _keys {aura: [U8; 32]}
     * @param {unknown} _proof Vec<U8>
     * @instance
     */
    setKeys: async (walletClient: WalletClient, _keys: unknown, _proof: unknown): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "Session", "setKeys", false, {
        keys: _keys,
        proof: _proof,
      });
    },

    /**
     * Similar to {@link: pangoro/session/calls/setKeys}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    setKeysH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "Session", "setKeys", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildSetKeysCall: (_keys: unknown, _proof: unknown) => {
      return buildRuntimeCall(metadata, "Session", "setKeys", {
        keys: _keys,
        proof: _proof,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildSetKeysCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildSetKeysCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "Session", "setKeys", argsBytes);
    },

    /**
     * Removes any session key(s) of the function caller.
     *
     * This doesn't take effect until the next session.
     *
     * The dispatch origin of this function must be Signed and the account must be either be
     * convertible to a validator ID using the chain's typical addressing system (this usually
     * means being a controller account) or directly convertible into a validator ID (which
     * usually means being a stash account).
     *
     * # <weight>
     * - Complexity: `O(1)` in number of key types. Actual cost depends on the number of length
     *   of `T::Keys::key_ids()` which is fixed.
     * - DbReads: `T::ValidatorIdOf`, `NextKeys`, `origin account`
     * - DbWrites: `NextKeys`, `origin account`
     * - DbWrites per key id: `KeyOwner`
     * # </weight>
     *
     * @instance
     */
    purgeKeys: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "Session", "purgeKeys", false, {});
    },

    /**
     * Similar to {@link: pangoro/session/calls/purgeKeys}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    purgeKeysH: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "Session", "purgeKeys", true);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildPurgeKeysCall: () => {
      return buildRuntimeCall(metadata, "Session", "purgeKeys", {});
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildPurgeKeysCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildPurgeKeysCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "Session", "purgeKeys", argsBytes);
    },
  };
};
