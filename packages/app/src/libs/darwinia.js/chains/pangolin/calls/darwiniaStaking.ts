/**
 * This is the doc comment for pallet `DarwiniaStaking`'s calls.
 *
 * `DarwiniaStaking`'s storages: {@link: module:pangolin/darwiniaStaking/storages}
 *
 * @module pangolin/darwiniaStaking/calls
 */
import { Dispatch } from "../../../src/call";
import { buildRuntimeCall, decodeCall } from "../../../src/helpers";
import { Metadata } from "@polkadot/types";
import type { WalletClient } from "@wagmi/core";
import { TransactionReceipt, Hex } from "viem";

export const getDarwiniaStaking = (dispatch: Dispatch, metadata: Metadata) => {
  return {
    /**
     * Add stakes to the staking pool.
     *
     * This will transfer the stakes to a pallet/contact account.
     *
     * @param {unknown} _ring_amount U128
     * @param {unknown} _kton_amount U128
     * @param {unknown} _deposits Vec<U16>
     * @instance
     */
    stake: async (
      walletClient: WalletClient,
      _ring_amount: unknown,
      _kton_amount: unknown,
      _deposits: unknown
    ): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "stake", false, {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/stake}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    stakeH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "stake", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildStakeCall: (_ring_amount: unknown, _kton_amount: unknown, _deposits: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "stake", {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildStakeCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildStakeCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "stake", argsBytes);
    },

    /**
     * Withdraw stakes from the staking pool.
     *
     * @param {unknown} _ring_amount U128
     * @param {unknown} _kton_amount U128
     * @param {unknown} _deposits Vec<U16>
     * @instance
     */
    unstake: async (
      walletClient: WalletClient,
      _ring_amount: unknown,
      _kton_amount: unknown,
      _deposits: unknown
    ): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "unstake", false, {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/unstake}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    unstakeH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "unstake", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildUnstakeCall: (_ring_amount: unknown, _kton_amount: unknown, _deposits: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "unstake", {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildUnstakeCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildUnstakeCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "unstake", argsBytes);
    },

    /**
     * Cancel the `unstake` operation.
     *
     * Re-stake the unstaking assets immediately.
     *
     * @param {unknown} _ring_amount U128
     * @param {unknown} _kton_amount U128
     * @param {unknown} _deposits Vec<U16>
     * @instance
     */
    restake: async (
      walletClient: WalletClient,
      _ring_amount: unknown,
      _kton_amount: unknown,
      _deposits: unknown
    ): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "restake", false, {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/restake}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    restakeH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "restake", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildRestakeCall: (_ring_amount: unknown, _kton_amount: unknown, _deposits: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "restake", {
        ring_amount: _ring_amount,
        kton_amount: _kton_amount,
        deposits: _deposits,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildRestakeCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildRestakeCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "restake", argsBytes);
    },

    /**
     * Claim the stakes from the pallet/contract account.
     *
     * @instance
     */
    claim: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "claim", false, {});
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/claim}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    claimH: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "claim", true);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildClaimCall: () => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "claim", {});
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildClaimCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildClaimCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "claim", argsBytes);
    },

    /**
     * Declare the desire to collect.
     *
     * Effects will be felt at the beginning of the next session.
     *
     * @param {unknown} _commission U32
     * @instance
     */
    collect: async (walletClient: WalletClient, _commission: unknown): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "collect", false, {
        commission: _commission,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/collect}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    collectH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "collect", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildCollectCall: (_commission: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "collect", {
        commission: _commission,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildCollectCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildCollectCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "collect", argsBytes);
    },

    /**
     * Declare the desire to nominate a collator.
     *
     * Effects will be felt at the beginning of the next session.
     *
     * @param {unknown} _target [U8; 20]
     * @instance
     */
    nominate: async (walletClient: WalletClient, _target: unknown): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "nominate", false, {
        target: _target,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/nominate}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    nominateH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "nominate", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildNominateCall: (_target: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "nominate", {
        target: _target,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildNominateCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildNominateCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "nominate", argsBytes);
    },

    /**
     * Declare no desire to either collect or nominate.
     *
     * Effects will be felt at the beginning of the next era.
     *
     * If the target is a collator, its nominators need to re-nominate.
     *
     * @instance
     */
    chill: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "chill", false, {});
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/chill}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    chillH: async (walletClient: WalletClient): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "chill", true);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildChillCall: () => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "chill", {});
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildChillCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildChillCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "chill", argsBytes);
    },

    /**
     * Set collator count.
     *
     * This will apply to the incoming session.
     *
     * Require root origin.
     *
     * @param {unknown} _count U32
     * @instance
     */
    setCollatorCount: async (walletClient: WalletClient, _count: unknown): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "setCollatorCount", false, {
        count: _count,
      });
    },

    /**
     * Similar to {@link: pangolin/darwiniaStaking/calls/setCollatorCount}, but with scale encoded args.
     *
     * @param {Hex | Uint8Array} argsBytes the args bytes
     * @instance
     */
    setCollatorCountH: async (walletClient: WalletClient, argsBytes: Hex | Uint8Array): Promise<TransactionReceipt> => {
      return await dispatch(walletClient, "DarwiniaStaking", "setCollatorCount", true, argsBytes);
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     *
     * @returns {CallAsParam}
     */
    buildSetCollatorCountCall: (_count: unknown) => {
      return buildRuntimeCall(metadata, "DarwiniaStaking", "setCollatorCount", {
        count: _count,
      });
    },

    /**
     * Build a call object to be used as a call param in other functions, such as `utilities.batchAll`.
     * Similar to buildSetCollatorCountCall, but with scale encoded args.
     *
     * @returns {CallAsParam}
     */
    buildSetCollatorCountCallH: (argsBytes: Hex | Uint8Array) => {
      return decodeCall(metadata, "DarwiniaStaking", "setCollatorCount", argsBytes);
    },
  };
};
