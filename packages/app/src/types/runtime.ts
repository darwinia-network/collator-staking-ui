import type { Vec, Struct, u32, u128, bool } from "@polkadot/types-codec";
import type { AccountId } from "@polkadot/types/interfaces/runtime";
import { RegistrationJudgement } from "@polkadot/types/interfaces";

export interface FrameSystemAccountInfo extends Struct {
  readonly nonce: u32;
  readonly consumers: u32;
  readonly providers: u32;
  readonly sufficients: u32;
  readonly data: DarwiniaCommonRuntimeImplsAccountData;
}
export interface DarwiniaCommonRuntimeImplsAccountData extends Struct {
  readonly free: u128;
  readonly reserved: u128;
  readonly freeKton: u128;
  readonly reservedKton: u128;
}

export interface PalletIdentityIdentityInfo extends Struct {
  display?: string;
  displayParent?: string;
  email?: string;
  image?: string;
  legal?: string;
  other?: Record<string, string>;
  parent?: AccountId;
  pgp?: string;
  riot?: string;
  twitter?: string;
  web?: string;
}

export interface PalletIdentityIdentityInfo extends Struct {
  display?: string;
  displayParent?: string;
  email?: string;
  image?: string;
  legal?: string;
  other?: Record<string, string>;
  parent?: AccountId;
  pgp?: string;
  riot?: string;
  twitter?: string;
  web?: string;
}

export interface PalletIdentityRegistration extends Struct {
  judgements: Vec<RegistrationJudgement>;
  info: PalletIdentityIdentityInfo;
}

export interface DarwiniaStakingLedgerEncoded extends Struct {
  stakedRing: u128;
  stakedKton: u128;
  stakedDeposits?: Uint8Array;
}

export interface DepositEncoded extends Struct {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  id: u128;
  value: u128;
  startTime: u128;
  expiredTime: u128;
  inUse: bool;
}

export interface PalletAssetsAssetAccountEncoded extends Struct {
  balance: u128;
  isFrozen: bool;
}

export interface PalletAssetsAssetAccount extends Struct {
  balance: u128;
  isFrozen: bool;
}
