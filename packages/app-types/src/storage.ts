import BigNumber from "bignumber.js";
import { Collator, Deposit, StakingAsset } from "./staking";
import { u128, Struct, bool } from "@polkadot/types";

export interface UnbondingAsset {
  depositId?: number;
  amount: BigNumber;
  expiredAtBlock: number;
  expiredHumanTime: string;
  isExpired: boolean;
}

export interface AssetDetail {
  bonded: BigNumber;
  totalOfDepositsInStaking?: BigNumber;
  unbondingRing?: UnbondingAsset[];
  unbondingKton?: UnbondingAsset[];
  unbondingDeposits?: UnbondingAsset[];
}

export interface AssetDistribution {
  ring: AssetDetail;
  kton: AssetDetail;
}

export interface AssetBalance {
  ring: BigNumber;
  kton: BigNumber;
}

export interface StorageCtx {
  power: BigNumber | undefined;
  stakedAssetDistribution: AssetDistribution | undefined;
  calculatePower: (stakingAsset: StakingAsset) => BigNumber;
  calculateExtraPower: (stakingAsset: StakingAsset) => BigNumber;
  deposits: Deposit[] | undefined;
  stakedDepositsIds: number[] | undefined;
  isLoadingLedger: boolean | undefined;
  isLoadingPool: boolean | undefined;
  collators: Collator[] | undefined;
  balance: AssetBalance | undefined;
  currentlyNominatedCollator: Collator | undefined | null;
  setNewUserIntroStakingValues: (values: UserIntroValues | undefined) => void;
  newUserIntroStakingValues: UserIntroValues | undefined;
  sessionDuration: number | undefined;
  unbondingDuration: number | undefined;
  minimumDepositAmount: BigNumber | undefined;
}

export interface UserIntroValues {
  ringAmount: BigNumber;
  ktonAmount: BigNumber;
  depositAmount: BigNumber;
  totalPower: BigNumber;
}

export interface PalletAssetsAssetAccountEncoded extends Struct {
  balance: u128;
  isFrozen: bool;
}

export interface PalletAssetsAssetAccount extends Struct {
  balance: BigNumber;
  isFrozen: boolean;
}
