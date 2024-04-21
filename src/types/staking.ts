import type { Struct, Enum, u16, u128, bool } from "@polkadot/types-codec";
import type { Balance } from "@polkadot/types/interfaces";

export interface DarwiniaStakingLedger extends Struct {
  stakedRing?: string;
  stakedKton?: string;
  stakedDeposits?: number[];
  unstakingDeposits?: [number, number][];
  unstakingRing?: [number, number][];
  unstakingKton?: [number, number][];

  ring?: string;
  deposits?: number[];
}

export interface DepositCodec extends Struct {
  id: u16;
  value: Balance;
  startTime: u128;
  expiredTime: u128;
  inUse: bool;
}

export interface Deposit {
  id: number;
  accountId: string;
  value: bigint;
  reward: bigint;
  startTime: number;
  expiredTime: number;
  canEarlyWithdraw: boolean;
  inUse: boolean;
}

export interface UnbondingInfo {
  depositId: number;
  amount: bigint;
  expiredAtBlock: number;
  expiredTimestamp: number; // millisecond
  isExpired: boolean;
}

export interface DarwiniaStakingRateLimiter extends Enum {
  readonly isPos: boolean;
  readonly isNeg: boolean;
  readonly asPos: Balance;
  readonly asNeg: Balance;
}
