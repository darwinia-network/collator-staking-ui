import powerIcon from "../../assets/images/power.svg";
import { localeKeys, useAppTranslation } from "../../locale";
import ringIcon from "../../assets/images/ring.svg";
import ktonIcon from "../../assets/images/kton.svg";
import crabIcon from "../../assets/images/crab.svg";
import cktonIcon from "../../assets/images/ckton.svg";
import { useStaking, useWallet } from "../../hooks";
import { ChainID, StakingRecord } from "../../types";
import { getChainConfig, prettifyNumber, toTimeAgo } from "../../utils";
import { useQuery } from "@apollo/client";
import { BN_ZERO, GET_LATEST_STAKING_REWARDS } from "../../config";
import { Spinner, Tooltip } from "@darwinia/ui";
import { ethers } from "ethers";
import { formatBalance } from "../../utils";
import { useMemo } from "react";

interface StakingStashQuery {
  accountAddress: string;
  itemsCount: number;
}

export const AccountOverview = () => {
  const { t } = useAppTranslation();
  const { currentChain, activeAccount } = useWallet();
  const { power, stakedAssetDistribution, isLoadingLedger } = useStaking();

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) || null;
    }
    return null;
  }, [currentChain]);

  const {
    loading: isLoadingStakingData,
    data: stakingData,
    error,
  } = useQuery<{ stakingRecord: StakingRecord }, StakingStashQuery>(GET_LATEST_STAKING_REWARDS, {
    variables: {
      accountAddress: activeAccount ? ethers.utils.getAddress(activeAccount) : "",
      itemsCount: 3,
    },
  });

  const ringTokenIcon = chainConfig?.chainId === ChainID.CRAB ? crabIcon : ringIcon;
  const ktonTokenIcon = chainConfig?.chainId === ChainID.CRAB ? cktonIcon : ktonIcon;

  return (
    <div className={"flex gap-[20px] lg:gap-0 justify-between flex-col lg:flex-row"}>
      {/*Power Card*/}
      <div className={"card lg:max-w-[66.08%] flex-1 flex flex-col gap-[20px] bg-primary"}>
        <div className={"flex justify-between items-center"}>
          <div className={"flex items-center gap-[10px] lg:gap-[30px]"}>
            <img className={"w-[30px] lg:w-[44px]"} src={powerIcon} alt="image" />
            <div className={"text-24-bold text-[30px]"}>{t(localeKeys.power)}</div>
          </div>
          <div className={"text-24-bold text-[30px]"}>{prettifyNumber(power?.toString() ?? 0)}</div>
        </div>
        <Spinner isLoading={isLoadingStakingData} size={"small"} className={"card"}>
          <div className={"flex gap-[10px] flex-col"}>
            <div className={"border-b divider pb-[10px] text-14-bold"}>{t(localeKeys.latestStakingRewards)}</div>
            <div className={"min-h-[92px] flex flex-col text-14-bold"}>
              {!error && stakingData?.stakingRecord && stakingData?.stakingRecord.rewards.nodes.length > 0 ? (
                <div className={"flex flex-col gap-[10px]"}>
                  {stakingData.stakingRecord.rewards.nodes.map((item) => {
                    return (
                      <div className={"flex justify-between"} key={item.id}>
                        <div>
                          <Tooltip message={<div>{formatBalance(item.amount, { precision: 8 })}</div>}>
                            <div>
                              {formatBalance(item.amount)} {chainConfig?.ring.symbol}
                            </div>
                          </Tooltip>
                        </div>
                        <div>{toTimeAgo(item.blockTime, true)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={"text-halfWhite"}>{t(localeKeys.noRewards)}</div>
              )}
            </div>
          </div>
        </Spinner>
        <div className={"flex lg:justify-center text-12 gap-[8px]"}>
          <div className={"text-halfWhite"}>{t(localeKeys.seeDetailed)}</div>
          <a className={"clickable underline"} target="_blank" href={chainConfig?.explorer.url} rel="noreferrer">
            {chainConfig?.explorer.name}→
          </a>
        </div>
      </div>
      {/*Staking reserve*/}
      <Spinner
        size={"small"}
        className={"card flex flex-col justify-center lg:w-[32.25%] shrink-0"}
        isLoading={!!isLoadingLedger}
      >
        <div>
          <div className={"divider border-b pb-[20px] text-18-bold"}>{t(localeKeys.reservedInStaking)}</div>
          <div className={"flex flex-col gap-[20px] mt-[20px]"}>
            {/*RING*/}
            <div className={"divider border-b pb-[20px] gap-[20px] flex flex-col"}>
              <div className={"flex gap-[5px] items-center"}>
                <img className={"w-[30px]"} src={ringTokenIcon} alt="image" />
                <div className={"uppercase text-18-bold"}>{chainConfig?.ring.symbol ?? "RING"}</div>
              </div>
              <div className={"flex flex-col gap-[2px]"}>
                <div className={"flex justify-between"}>
                  <div className={"flex items-center gap-[5px]"}>
                    <div>{t(localeKeys.bonded)}</div>
                  </div>
                  <div className={"text-14-bold"}>
                    <Tooltip
                      message={
                        <div>
                          {formatBalance(
                            (stakedAssetDistribution?.ring.bonded ?? BN_ZERO).add(
                              stakedAssetDistribution?.ring.totalOfDepositsInStaking ?? BN_ZERO
                            ),
                            { precision: 8 }
                          )}
                        </div>
                      }
                    >
                      {formatBalance(
                        (stakedAssetDistribution?.ring.bonded ?? BN_ZERO).add(
                          stakedAssetDistribution?.ring.totalOfDepositsInStaking ?? BN_ZERO
                        )
                      )}
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            {/*KTON*/}
            <div className={"gap-[20px] flex flex-col"}>
              <div className={"flex gap-[5px] items-center"}>
                <img className={"w-[30px]"} src={ktonTokenIcon} alt="image" />
                <div className={"uppercase text-18-bold"}>{chainConfig?.kton.symbol ?? "KTON"}</div>
              </div>
              <div className={"flex flex-col gap-[2px]"}>
                <div className={"flex justify-between"}>
                  <div>{t(localeKeys.bonded)}</div>
                  <div className={"text-14-bold"}>
                    <Tooltip
                      message={
                        <div>{formatBalance(stakedAssetDistribution?.kton.bonded ?? BN_ZERO, { precision: 8 })}</div>
                      }
                    >
                      {formatBalance(stakedAssetDistribution?.kton.bonded ?? BN_ZERO)}
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spinner>
    </div>
  );
};
