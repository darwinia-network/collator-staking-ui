import { MetaMaskError, PalletIdentityRegistration, Storage } from "@darwinia/app-types";
import { STORAGE as APP_STORAGE } from "@darwinia/app-config";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";

export const setStore = (key: keyof Storage, value: unknown) => {
  try {
    const oldValue = JSON.parse(localStorage.getItem(APP_STORAGE) ?? "{}");
    const updatedValue = {
      ...oldValue,
      [key]: value,
    };
    localStorage.setItem(APP_STORAGE, JSON.stringify(updatedValue));
  } catch (e) {
    //ignore
  }
};

export const getStore = <T>(key: keyof Storage): T | undefined | null => {
  try {
    const oldValue = JSON.parse(localStorage.getItem(APP_STORAGE) ?? "{}") as Storage;
    return oldValue[key] as T | undefined | null;
  } catch (e) {
    return undefined;
  }
};

export const toShortAddress = (accountAddress: string) => {
  const firstPart = accountAddress.slice(0, 5);
  const secondPart = accountAddress.slice(-4);
  return `${firstPart}...${secondPart}`;
};

export const isValidNumber = (value: string): boolean => {
  if (value.trim().length === 0) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return !isNaN(value);
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

interface PrettyNumberInput {
  number: BigNumber;
  precision?: number;
  round?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  keepTrailingZeros?: boolean;
  shouldFormatToEther?: boolean;
}

export const prettifyTooltipNumber = (number: BigNumber, shouldFormatToEther = true) => {
  return prettifyNumber({
    number,
    precision: 8,
    keepTrailingZeros: true,
    shouldFormatToEther: shouldFormatToEther,
  });
};

export const prettifyNumber = ({
  number,
  precision = 4,
  round = BigNumber.ROUND_DOWN,
  keepTrailingZeros = true,
  shouldFormatToEther = true,
}: PrettyNumberInput) => {
  if (keepTrailingZeros) {
    // will return a number like 12,345.506000
    if (shouldFormatToEther) {
      const numberInEther = formatToEther(number.toFixed());
      return BigNumber(numberInEther).toFormat(precision, round);
    }
    return number.toFormat(precision, round);
  }

  // will return a number like 12,345.506
  if (shouldFormatToEther) {
    const numberInEther = formatToEther(number.toFixed());
    return BigNumber(numberInEther).decimalPlaces(precision, round).toFormat();
  }
  return number.decimalPlaces(precision, round).toFormat();
};

export const formatToEther = (valueInWei: string): string => {
  return ethers.utils.formatEther(valueInWei);
};

export const formatToWei = (valueInEther: string) => {
  return ethers.utils.parseEther(valueInEther);
};

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
