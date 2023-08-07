import { Metadata, TypeRegistry } from "@polkadot/types";
import type { HexString } from "@polkadot/util/types";
import { camelToSnakeCase } from "./utils";
import { u8aConcat } from "@polkadot/util";
import { Hex, concat, toHex } from "viem";

export function buildMetadata(metaStatic: Uint8Array | HexString) {
  const registry = new TypeRegistry();
  const metadata = new Metadata(registry, metaStatic);
  registry.setMetadata(metadata);
  return metadata;
}

export type CallMeta = {
  callIndex: [number, number];
  args: string[];
  belongsTo: string;
  callName: [string, string];
};

export function getCallMeta(metadata: Metadata, palletName: string, callName: string): CallMeta {
  // get pallet
  const pallet = metadata.asLatest.pallets.find((pallet) => {
    return pallet.name.toString() == palletName;
  });
  if (!pallet) {
    throw `Can not find pallet ${palletName} in metadata`;
  }

  // get call which is a variant item from pallet
  if (pallet.calls.isNone) {
    throw `Pallet ${palletName} has no calls`;
  }
  const calls = pallet.calls.unwrap();
  const callsType = metadata.registry.lookup.getSiType(calls.type);
  const call = callsType.def.asVariant.variants.find((v) => {
    return v.name.toString() == callName;
  });
  if (!call) {
    throw `Can not find ${callName} dispatch call in ${palletName} pallet`;
  }

  return {
    callIndex: [pallet.index.toNumber(), call.index.toNumber()],
    args: call.fields.map((field) => {
      return metadata.registry.createLookupType(field.type);
    }),
    belongsTo: metadata.registry.createLookupType(calls.type),
    callName: [palletName, callName],
  };
}

export type CallAsParam = {
  callIndex: [number, number];
  args: any;
};

export function buildRuntimeCall(metadata: Metadata, palletName: string, callName: string, args: object): CallAsParam {
  callName = camelToSnakeCase(callName);

  const { callIndex } = getCallMeta(metadata, palletName, callName);
  return {
    callIndex: [callIndex[0], callIndex[1]],
    args: args,
  };
}

export function decodeCall(
  metadata: Metadata,
  palletName: string,
  callName: string,
  argsBytes: Hex | Uint8Array
): CallAsParam {
  const { callIndex, belongsTo } = getCallMeta(metadata, palletName, camelToSnakeCase(callName));

  const callBytes = concat([toHex(callIndex[1]), argsBytes]);
  const decoded = metadata.registry.createType(belongsTo, callBytes).toJSON();

  return {
    callIndex: callIndex,
    args: (decoded as { [index: string]: object })[callName],
  };
}

export function encodeCall(metadata: Metadata, palletName: string, callName: string, args: { [key: string]: unknown }) {
  callName = camelToSnakeCase(callName);

  const { callIndex, belongsTo } = getCallMeta(metadata, palletName, callName);

  const callNameWithArgs: { [key: string]: unknown } = {};
  callNameWithArgs[callName] = args;

  const encodedCall = u8aConcat([callIndex[0]], metadata.registry.createType(belongsTo, callNameWithArgs).toU8a());

  return encodedCall;
}
