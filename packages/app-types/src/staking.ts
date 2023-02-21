import { u128, Struct, Vec } from "@polkadot/types";
import type { AccountId, BlockNumber } from "@polkadot/types/interfaces/runtime";
import BigNumber from "bignumber.js";
import { RegistrationJudgement } from "@polkadot/types/interfaces";
import { UnbondingAsset } from "./storage";
import { BigNumber as EthersBigNumber } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

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

export interface Collator {
  id: string;
  accountAddress: string;
  accountName?: string;
  totalStaked: BigNumber;
  commission: string;
  lastSessionBlocks: number;
  isActive?: boolean;
  nominators: string[];
}

export interface Reward {
  id: string;
  amount: string;
  blockNumber: number;
  blockTime: string;
}

export interface RewardNode {
  nodes: Reward[];
}

export interface StakingRecord {
  id: string; //accountId
  totalReward: string; //RING/PRING,etc amount in string
  rewards: RewardNode;
}

export interface StakingAsset {
  ring: BigNumber;
  kton: BigNumber;
}

/*Staking types start here*/
export interface DarwiniaStakingLedgerEncoded extends Struct {
  stakedRing: u128;
  stakedKton: u128;
  stakedDeposits?: Uint8Array;
}

export interface DarwiniaStakingLedger {
  stakedRing: BigNumber;
  stakedKton: BigNumber;
  stakedDeposits?: number[];
  unstakingDeposits?: [number, number][];
  unstakingRing?: [number, number][];
  unstakingKton?: [number, number][];
}

export interface DepositEncoded extends Struct {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  id: u128;
  value: u128;
  expiredTime: u128;
}

export interface Deposit {
  id: number;
  accountId: string;
  value: BigNumber;
  reward: BigNumber;
  startTime: number;
  expiredTime: number;
  canEarlyWithdraw: boolean;
  inUse: boolean;
}

export interface Bond {
  amount: BigNumber;
  symbol: string;
  isDeposit?: boolean;
  isRingBonding?: boolean;
  isKtonBonding?: boolean;
  unbondingRing?: UnbondingAsset[];
  unbondingKton?: UnbondingAsset[];
  unbondingDeposits?: UnbondingAsset[];
}

export interface Delegate {
  id: string;
  collator?: string;
  staked: BigNumber;
  bondedTokens: Bond[];
  isActive?: boolean;
  accountNeedsACollator?: boolean;
  canUnbondAll: boolean;
}

export interface UnbondingDeposit {
  depositId: number;
  isUnbondingComplete: boolean;
  expireBlock: number;
}

/*Staking types end here*/

export interface StakeAndNominateParams {
  ringAmount: EthersBigNumber;
  ktonAmount: EthersBigNumber;
  depositIds: EthersBigNumber[];
  collatorAddress: string;
  provider: Web3Provider | undefined;
}
