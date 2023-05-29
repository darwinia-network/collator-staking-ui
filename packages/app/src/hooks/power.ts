import { BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { useCallback, useEffect, useState } from "react";
import { convertAmountToPower } from "../utils";
import { StakingAmount, UnSubscription } from "../types";
import { Balance } from "@polkadot/types/interfaces";
import { BN_ZERO } from "../config";

interface Pool {
  ring: BigNumber;
  kton: BigNumber;
}

interface Params {
  polkadotApi: ApiPromise | undefined;
  stakingAmount: StakingAmount | undefined;
}

export const usePower = ({ polkadotApi, stakingAmount }: Params) => {
  const [isPoolLoading, setIsPoolLoading] = useState<boolean>(true);
  const [pool, setPool] = useState<Pool>({ ring: BN_ZERO, kton: BN_ZERO });
  const [power, setPower] = useState<BigNumber>(BN_ZERO);

  // fetch data from kton and ring pool
  useEffect(() => {
    let ringUnsubscription: UnSubscription = () => undefined;
    let ktonUnsubscription: UnSubscription = () => undefined;

    if (polkadotApi) {
      Promise.all([
        polkadotApi.query.darwiniaStaking.ringPool((value: Balance) => {
          setPool((prev) => {
            return {
              ...prev,
              ring: BigNumber.from(value.toString()),
            };
          });
        }) as unknown as Promise<UnSubscription>,
        polkadotApi.query.darwiniaStaking.ktonPool((value: Balance) => {
          setPool((prev) => {
            return {
              ...prev,
              kton: BigNumber.from(value.toString()),
            };
          });
        }) as unknown as Promise<UnSubscription>,
      ])
        .then(([ringUnsub, ktonUnsub]) => {
          setIsPoolLoading(false);

          ringUnsubscription = ringUnsub;
          ktonUnsubscription = ktonUnsub;
        })
        .catch((error) => {
          setIsPoolLoading(false);
          console.error(error);
        });
    }

    return () => {
      ringUnsubscription();
      ktonUnsubscription();
    };
  }, [polkadotApi]);

  useEffect(() => {
    if (stakingAmount) {
      setPower(convertAmountToPower(stakingAmount.ring, stakingAmount.kton, pool.ring, pool.kton));
    } else {
      setPower(BN_ZERO);
    }
  }, [pool, stakingAmount]);

  /*This method is used to convert assets to power, simply knowing
   * how much power a certain asset is taking in the total power. NOT adding extra power,
   * NOTE: stakingAmount values must be in Wei */
  const calculatePower = useCallback(
    (stakingAmount: StakingAmount) => {
      return convertAmountToPower(stakingAmount.ring, stakingAmount.kton, pool.ring, pool.kton);
    },
    [pool]
  );

  /* This method is used to calculate the amount of power that you'll get after adding a certain
   * amount if RING or KTON in the pool */
  /*StakingAmount values should be in Wei*/
  const calculateExtraPower = useCallback(
    (stakingAmount: StakingAmount) => {
      const initialBondedRing = BN_ZERO;
      const initialBondedKton = BN_ZERO;
      const initialPower = convertAmountToPower(initialBondedRing, initialBondedKton, pool.ring, pool.kton);
      const accumulatedPower = convertAmountToPower(
        initialBondedRing.add(stakingAmount.ring),
        initialBondedKton.add(stakingAmount.kton),
        pool.ring.add(stakingAmount.ring),
        pool.kton.add(stakingAmount.kton)
      );
      return accumulatedPower.sub(initialPower);
    },
    [pool]
  );

  return {
    pool,
    isPoolLoading,
    power,
    calculateExtraPower,
    calculatePower,
  };
};
