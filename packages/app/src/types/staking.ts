import { BigNumber } from "ethers";
import { Provider } from "@ethersproject/providers";

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

export interface StakingAmount {
  ring: BigNumber;
  kton: BigNumber;
}

export interface DarwiniaStakingLedger {
  stakedRing: string;
  stakedKton: string;
  stakedDeposits?: number[];
  unstakingDeposits?: [number, number][];
  unstakingRing?: [number, number][];
  unstakingKton?: [number, number][];
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
  unbondingRing?: UnbondingInfo[];
  unbondingKton?: UnbondingInfo[];
  unbondingDeposits?: UnbondingInfo[];
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
  ringAmount: BigNumber;
  ktonAmount: BigNumber;
  depositIds: BigNumber[];
  collatorAddress: string;
  provider: Provider | undefined;
}

export interface UnbondingInfo {
  depositId?: number;
  amount: BigNumber;
  expiredAtBlock: number;
  expiredHumanTime: string;
  isExpired: boolean;
}

export interface AssetDetail {
  bonded: BigNumber;
  totalOfDepositsInStaking?: BigNumber;
  unbondingRing?: UnbondingInfo[];
  unbondingKton?: UnbondingInfo[];
  unbondingDeposits?: UnbondingInfo[];
}

export interface AssetDistribution {
  ring: AssetDetail;
  kton: AssetDetail;
}

export interface AssetBalance {
  ring: BigNumber;
  kton: BigNumber;
}

export interface UserIntroValues {
  ringAmount: BigNumber;
  ktonAmount: BigNumber;
  depositAmount: BigNumber;
  totalPower: BigNumber;
}
