export function prettyNumber(num: bigint | number | string) {
  return num.toString().replace(/(?=(?!^)(\d{3})+$)/g, ",");
}

export const stakingToPower = (
  stakingRing: bigint,
  stakingKton: bigint,
  ringPool: bigint,
  ktonPool: bigint
): bigint => {
  /**
   * power calculation formula comes from
   * https://github.com/darwinia-network/darwinia/blob/2f0941d6f2a896bac2900d7c3f2d17a46ca6948b/pallet/staking/src/lib.rs#L778-L802
   */
  const ringPower = ringPool > 0 ? (500000000n * stakingRing) / ringPool : 0n;
  const ktonPower = ktonPool > 0 ? (500000000n * stakingKton) / ktonPool : 0n;

  return ringPower + ktonPower;
};

export const calcKtonReward = (depositRing: bigint, depositMonths: number) => {
  /**
   * the original formula for calculating KTON comes from
   * https://github.com/darwinia-network/darwinia-common/blob/main/frame/staking/src/inflation.rs#L129
   */
  if (depositRing > 0 && depositMonths) {
    const n = 67n ** BigInt(depositMonths);
    const d = 66n ** BigInt(depositMonths);
    const quot = n / d;
    const remainder = n % d;
    const precision = 1000n;

    return precision * (quot - 1n) + (precision * remainder * depositRing) / d / 1970000n;
  }

  return 0n;
};

export const commissionWeightedPower = (originPower: bigint, commission: string) => {
  const c = Number(commission.replace(/,/g, "").split("%")[0]);
  return (originPower * BigInt(100 - (Number.isNaN(c) ? 100 : c))) / 100n;
};
