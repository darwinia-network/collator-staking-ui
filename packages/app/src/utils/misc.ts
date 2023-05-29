import { BN_ZERO } from "../config";
import { MetaMaskError } from "../types";
import { utils, BigNumber, BigNumberish } from "ethers";

export const isValidNumber = (value: string): boolean => {
  if (value.trim().length === 0) {
    return false;
  }
  return !Number.isNaN(Number(value));
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return Promise.resolve(true);
  } catch (e) {
    return Promise.resolve(false);
    //ignore
  }
};

export const prettifyNumber = utils.commify;

export const formatBalance = (value: BigNumberish, options?: { precision?: number; keepZero?: boolean }) => {
  const precision = options?.precision ?? 4;
  const keepZero = options?.keepZero ?? true;
  const [integer, decimal] = utils.formatEther(value).split(".");

  if (decimal) {
    const fixedDecimal = Number(`0.${decimal}`).toFixed(precision).split(".").at(1);
    if (fixedDecimal) {
      if (fixedDecimal.length < precision && keepZero) {
        return `${utils.commify(integer)}.${fixedDecimal.padEnd(precision, "0")}`;
      }

      return `${utils.commify(integer)}.${fixedDecimal}`;
    }
  }

  if (keepZero) {
    return `${utils.commify(integer)}.${"0".padEnd(precision, "0")}`;
  }

  return utils.commify(integer);
};

export const parseBalance = utils.parseEther;

export const processTransactionError = (error: unknown) => {
  try {
    const castedError = error as unknown as MetaMaskError;

    if (castedError.data && castedError.data.message) {
      /*Stake precompile errors*/
      if (castedError.data.message.includes("ExceedMaxDeposits")) {
        return {
          code: 1,
          message: "You've reached the maximum deposit count",
        };
      }
      if (castedError.data.message.includes("ExceedMaxUnstakings")) {
        return {
          code: 2,
          message: "You've reached the maximum unstaking/unbonding count",
        };
      }
      if (castedError.data.message.includes("DepositNotFound")) {
        return {
          code: 3,
          message: "Deposit not found",
        };
      }
      if (castedError.data.message.includes("NotStaker")) {
        return {
          code: 4,
          message: "You're not a staker",
        };
      }
      if (castedError.data.message.includes("TargetNotCollator")) {
        return {
          code: 5,
          message: "You've chosen a none-collator",
        };
      }
      if (castedError.data.message.includes("ZeroCollatorCount")) {
        return {
          code: 6,
          message: "Collator count must not be zero",
        };
      }

      /*Deposit precompile errors*/
      if (castedError.data.message.includes("LockAtLeastSome")) {
        return {
          code: 7,
          message: "Deposited amount too low",
        };
      }

      if (castedError.data.message.includes("LockAtLeastOneMonth")) {
        return {
          code: 8,
          message: "Lock the deposit for at least one month",
        };
      }

      if (castedError.data.message.includes("LockAtMostThirtySixMonths")) {
        return {
          code: 9,
          message: "Lock time can't be more than 36 months",
        };
      }

      if (castedError.data.message.includes("DepositInUse")) {
        return {
          code: 10,
          message: "Deposit is already in use",
        };
      }

      if (castedError.data.message.includes("DepositNotInUse")) {
        return {
          code: 11,
          message: "Deposit not in use",
        };
      }

      if (castedError.data.message.includes("DepositAlreadyExpired")) {
        return {
          code: 12,
          message: "Deposit already expired",
        };
      }
    }
  } catch (e) {
    return {
      code: 900,
      message: "Unknown error",
    };
  }

  return {
    code: 900,
    message: "Unknown error",
  };
};

/*MAX_POWER is the number that I just took it from apps.darwinia.network in Darwinia 1.0*/
const MAX_POWER = 1000000000;
export const convertAmountToPower = (
  ringAmount: BigNumber,
  ktonAmount: BigNumber,
  poolRingAmount: BigNumber,
  poolKtonAmount: BigNumber
): BigNumber => {
  if (poolRingAmount.isZero()) {
    return BN_ZERO;
  }

  /*Power calculation formula is
   *  (ringAmount + (ktonAmount * (poolRingAmount / poolKtonAmount))) / (poolRingAmount * 2) * 1000000000
   *  */
  const divider = poolKtonAmount.isZero() ? BN_ZERO : poolRingAmount.div(poolKtonAmount);
  return ringAmount.add(ktonAmount.mul(divider)).mul(MAX_POWER).div(poolRingAmount.mul(2));
};

/*The original formula for calculating KTON comes from
https://github.com/darwinia-network/darwinia-common/blob/main/frame/staking/src/inflation.rs#L129 */
export const calcKtonFromRingDeposit = (ringAmount: BigNumber, depositMonths: number) => {
  if (!depositMonths || ringAmount.isZero()) {
    return BN_ZERO;
  }

  const n = BigNumber.from(67).pow(depositMonths);
  const d = BigNumber.from(66).pow(depositMonths);
  const quot = n.div(d);
  const remainder = n.mod(d);
  const precision = BigNumber.from(1000);

  return precision.mul(quot.sub(1)).add(precision.mul(remainder).div(d)).mul(ringAmount).div(1970000);
};
