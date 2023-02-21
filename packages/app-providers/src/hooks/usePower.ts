import BigNumber from "bignumber.js";
import { ApiPromise } from "@polkadot/api";
import { useCallback, useEffect, useState } from "react";
import { convertAssetToPower } from "@darwinia/app-utils";
import { StakingAsset } from "@darwinia/app-types";
import { UnSubscription } from "../storageProvider";
import { Balance } from "@polkadot/types/interfaces";

interface Pool {
  ring: BigNumber;
  kton: BigNumber;
}

interface Params {
  apiPromise: ApiPromise | undefined;
  stakingAsset: StakingAsset | undefined;
}

const usePower = ({ apiPromise, stakingAsset }: Params) => {
  const [isLoadingPool, setLoadingPool] = useState<boolean>(true);
  const [pool, setPool] = useState<Pool>({ ring: BigNumber(0), kton: BigNumber(0) });
  const [power, setPower] = useState<BigNumber>(BigNumber(0));

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
            ring: BigNumber(value.toString()),
          };
        });
      })) as unknown as UnSubscription;

      ktonUnsubscription = (await apiPromise.query.darwiniaStaking.ktonPool((value: Balance) => {
        setPool((old) => {
          return {
            ...old,
            kton: BigNumber(value.toString()),
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
      setPower(BigNumber(0));
      return;
    }
    const power = convertAssetToPower(stakingAsset.ring, stakingAsset.kton, pool.ring, pool.kton);
    setPower(power);
  }, [pool, stakingAsset]);

  /*This method is used to convert assets to power, simply knowing
   * how much power a certain asset is taking in the total power. NOT adding extra power,
   * NOTE: stakingAsset values must be in Wei */
  const calculatePower = useCallback(
    (stakingAsset: StakingAsset) => {
      return convertAssetToPower(stakingAsset.ring, stakingAsset.kton, pool.ring, pool.kton);
    },
    [pool]
  );

  /* This method is used to calculate the amount of power that you'll get after adding a certain
   * amount if RING or KTON in the pool */
  /*StakingAsset values should be in Wei*/
  const calculateExtraPower = useCallback(
    (stakingAsset: StakingAsset) => {
      const initialBondedRing = BigNumber(0);
      const initialBondedKton = BigNumber(0);
      const initialPower = convertAssetToPower(initialBondedRing, initialBondedKton, pool.ring, pool.kton);
      const accumulatedPower = convertAssetToPower(
        initialBondedRing.plus(stakingAsset.ring),
        initialBondedKton.plus(stakingAsset.kton),
        pool.ring.plus(stakingAsset.ring),
        pool.kton.plus(stakingAsset.kton)
      );
      return accumulatedPower.minus(initialPower);
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

export default usePower;
