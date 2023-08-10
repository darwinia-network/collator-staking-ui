export function prettyNumber(num: bigint | number | string) {
  return num.toString().replace(/(?=(?!^)(\d{3})+$)/g, ",");
}

export const stakingToPower = (
  stakingRing: bigint,
  stakingKton: bigint,
  ringPool: bigint,
  ktonPool: bigint
): bigint => {
  if (ringPool > 0) {
    /**
     * Power calculation formula is
     * (stakingRing + (stakingKton * (ringPool / ktonPool))) / (ringPool * 2) * 1000000000
     */
    const divider = ktonPool === 0n ? 0n : ringPool / ktonPool;
    return (1000000000n * (stakingRing + stakingKton * divider)) / (ringPool * 2n);
  }

  return 0n;
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
