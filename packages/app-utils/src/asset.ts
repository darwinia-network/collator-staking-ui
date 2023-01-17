import BigNumber from "bignumber.js";

/*MAX_POWER is the number that I just took it from apps.darwinia.network in Darwinia 1.0*/
const MAX_POWER = 1000000000;
export const convertAssetToPower = (
  ringAmount: BigNumber,
  ktonAmount: BigNumber,
  poolRingAmount: BigNumber,
  poolKtonAmount: BigNumber
): BigNumber => {
  if (poolRingAmount.isEqualTo(0)) {
    return BigNumber(0);
  }

  let divider = BigNumber(0);
  /*Power calculation formula is
   *  (ringAmount + (ktonAmount * (poolRingAmount / poolKtonAmount))) / (poolRingAmount * 2) * 1000000000
   *  */
  if (!poolKtonAmount.isEqualTo(0)) {
    divider = poolRingAmount.div(poolKtonAmount);
  }

  const power = ringAmount.plus(ktonAmount.times(divider)).div(poolRingAmount.times(2)).times(MAX_POWER).toFixed(0);

  return BigNumber(power);
};

/*The original formula for calculating KTON comes from
https://github.com/darwinia-network/darwinia-common/blob/main/frame/staking/src/inflation.rs#L129 */
/*The output will automatically be prettified (in form of thousands eg: 1,000,000.123456)*/
// = true
interface DepositInput {
  ringAmount: BigNumber;
  depositMonths: number;
  decimalPrecision?: number;
  round?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  keepTrailingZeros?: boolean;
}

export const calculateKtonFromRingDeposit = ({
  ringAmount,
  depositMonths,
  decimalPrecision = 9,
  round = BigNumber.ROUND_DOWN,
  keepTrailingZeros = true,
}: DepositInput): string => {
  if (depositMonths === 0 || ringAmount.isEqualTo(0)) {
    return BigNumber(0).toString();
  }

  const n = BigNumber(67).pow(depositMonths);
  const d = BigNumber(66).pow(depositMonths);
  const quot = n.dividedToIntegerBy(d);
  const remainder = n.mod(d);
  const precision = BigNumber(1000);
  const someMagicNumber = BigNumber(1970000); // I don't even know what this number is
  /* Mixing dividedToIntegerBy with div brings exactly the same result as how it used to be
   * on apps.darwinia.network in Darwinia 1.0 */
  const ktonValue = precision
    .times(quot.minus(1))
    .plus(precision.times(remainder).dividedToIntegerBy(d))
    .times(ringAmount)
    .div(someMagicNumber);
  if (keepTrailingZeros) {
    // will return a number like 12,345.506000
    return ktonValue.toFormat(decimalPrecision, round);
  }
  // will return a number like 12,345.506
  return ktonValue.decimalPlaces(decimalPrecision, round).toFormat();
};
