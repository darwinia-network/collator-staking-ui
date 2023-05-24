import { BigNumber } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { useCallback, useEffect, useState } from "react";
import { convertAmountToPower } from "../utils";
import { StakingAsset } from "../types";
import { Balance } from "@polkadot/types/interfaces";
import { BN_ZERO } from "../config";

type UnSubscription = () => void;

interface Pool {
  ring: BigNumber;
  kton: BigNumber;
}

interface Params {
  apiPromise: ApiPromise | undefined;
  stakingAsset: StakingAsset | undefined;
}

export const usePower = ({ apiPromise, stakingAsset }: Params) => {
  const [isLoadingPool, setLoadingPool] = useState<boolean>(true);
  const [pool, setPool] = useState<Pool>({ ring: BN_ZERO, kton: BN_ZERO });
  const [power, setPower] = useState<BigNumber>(BN_ZERO);

  // fetch data from kton and ring pool
  useEffect(() => {
    let ringUnsubscription: UnSubscription | undefined;
    let ktonUnsubscription: UnSubscription | undefined;
    const getPool = async () => {
      if (!apiPromise) {
        return;
      }
      setLoadingPool(true);

      ringUnsubscription = (await apiPromise.query.darwiniaStaking.ringPool((value: Balance) => {
        setPool((old) => {
          return {
            ...old,
            ring: BigNumber.from(value),
          };
        });
      })) as unknown as UnSubscription;

      ktonUnsubscription = (await apiPromise.query.darwiniaStaking.ktonPool((value: Balance) => {
        setPool((old) => {
          return {
            ...old,
            kton: BigNumber.from(value),
          };
        });
      })) as unknown as UnSubscription;

      setLoadingPool(false);
    };

    getPool().catch(() => {
      //ignore
      setLoadingPool(false);
    });

    return () => {
      if (ringUnsubscription) {
        ringUnsubscription();
      }
      if (ktonUnsubscription) {
        ktonUnsubscription();
      }
    };
  }, [apiPromise]);

  /*calculate power*/
  useEffect(() => {
    if (!stakingAsset) {
      setPower(BN_ZERO);
      return;
    }
    const power = convertAmountToPower(stakingAsset.ring, stakingAsset.kton, pool.ring, pool.kton);
    setPower(power);
  }, [pool, stakingAsset]);

  /*This method is used to convert assets to power, simply knowing
   * how much power a certain asset is taking in the total power. NOT adding extra power,
   * NOTE: stakingAsset values must be in Wei */
  const calculatePower = useCallback(
    (stakingAsset: StakingAsset) => {
      return convertAmountToPower(stakingAsset.ring, stakingAsset.kton, pool.ring, pool.kton);
    },
    [pool]
  );

  /* This method is used to calculate the amount of power that you'll get after adding a certain
   * amount if RING or KTON in the pool */
  /*StakingAsset values should be in Wei*/
  const calculateExtraPower = useCallback(
    (stakingAsset: StakingAsset) => {
      const initialBondedRing = BN_ZERO;
      const initialBondedKton = BN_ZERO;
      const initialPower = convertAmountToPower(initialBondedRing, initialBondedKton, pool.ring, pool.kton);
      const accumulatedPower = convertAmountToPower(
        initialBondedRing.add(stakingAsset.ring),
        initialBondedKton.add(stakingAsset.kton),
        pool.ring.add(stakingAsset.ring),
        pool.kton.add(stakingAsset.kton)
      );
      return accumulatedPower.sub(initialPower);
    },
    [pool]
  );

  return {
    pool,
    isLoadingPool,
    power,
    calculateExtraPower,
    calculatePower,
  };
};
