import { localeKeys, useAppTranslation } from "../../locale";
import { Button, CheckboxGroup, Dropdown, Input, notification, Tooltip } from "@darwinia/ui";
import ringIcon from "../../assets/images/ring.svg";
import ktonIcon from "../../assets/images/kton.svg";
import crabIcon from "../../assets/images/crab.svg";
import cktonIcon from "../../assets/images/ckton.svg";
import { useStaking, useWallet } from "../../hooks";
import caretDownIcon from "../../assets/images/caret-down.svg";
import JazzIcon from "../JazzIcon";
import switchIcon from "../../assets/images/switch.svg";
import { StakingRecords } from "../StakingRecords";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Deposit, Collator, MetaMaskError, ChainID } from "../../types";
import { SelectCollatorModal, SelectCollatorRefs } from "../SelectCollatorModal";
import {
  formatBalance,
  getChainConfig,
  isEthersApi,
  isValidNumber,
  parseBalance,
  prettifyNumber,
  processTransactionError,
  secondsToHumanTime,
} from "../../utils";
import { BigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { BN_ZERO } from "../../config";

export const StakingOverview = () => {
  const { t } = useAppTranslation();
  const { currentChain, signerApi } = useWallet();
  const {
    deposits,
    stakedDepositsIds,
    balance,
    sessionDuration,
    unbondingDuration,
    stakedAssetDistribution,
    currentNominatedCollator,
    calculateExtraPower,
  } = useStaking();
  const selectCollatorModalRef = useRef<SelectCollatorRefs>(null);
  const [selectedCollator, setSelectedCollator] = useState<Collator>();
  const [stakeAbleDeposits, setStakeAbleDeposits] = useState<Deposit[]>([]);
  const [depositsToStake, setDepositsToStake] = useState<Deposit[]>([]);
  const [ringToStake, setRingToStake] = useState<string>("");
  const [ktonToStake, setKtonToStake] = useState<string>("");
  const [ringHasError, setRingHasError] = useState<boolean>(false);
  const [ktonHasError, setKtonHasError] = useState<boolean>(false);
  const [powerByRing, setPowerByRing] = useState(BN_ZERO);
  const [powerByKton, setPowerByKton] = useState(BN_ZERO);
  const [powerByDeposits, setPowerByDeposits] = useState(BN_ZERO);
  const [accountIsStakingAlready, setAccountIsStakingAlready] = useState<boolean>(true);
  const { stakeAndNominate } = useStaking();

  /*This is the minimum Ring balance that should be left on the account
   * for gas fee */
  const minimumRingBalance = 0;

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const ringTokenIcon = chainConfig?.chainId === ChainID.CRAB ? crabIcon : ringIcon;
  const ktonTokenIcon = chainConfig?.chainId === ChainID.CRAB ? cktonIcon : ktonIcon;

  const getRingValueErrorJSX = () => {
    return ringHasError ? <div /> : null;
  };
  const getKtonValueErrorJSX = () => {
    return ktonHasError ? <div /> : null;
  };

  const canSubmitStakingForm = useCallback(() => {
    const isValidRing = isValidNumber(ringToStake);
    const isValidKton = isValidNumber(ktonToStake);
    const isDeposits = depositsToStake.length > 0;
    return isValidRing || isValidKton || isDeposits;
  }, [ringToStake, ktonToStake, depositsToStake]);

  const onRingToStakeChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setRingHasError(false);
    const value = event.target.value;
    const isValidAmount = isValidNumber(value);
    if (isValidAmount) {
      const power = calculateExtraPower({
        ring: parseBalance(value),
        kton: BN_ZERO,
      });
      setPowerByRing(power);
    } else {
      setPowerByRing(BN_ZERO);
    }
    setRingToStake(value);
  };

  const onKtonToStakeChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKtonHasError(false);
    const value = event.target.value;
    const isValidAmount = isValidNumber(value);
    if (isValidAmount) {
      const power = calculateExtraPower({
        ring: BN_ZERO,
        kton: parseBalance(value),
      });
      setPowerByKton(power);
    } else {
      setPowerByKton(BN_ZERO);
    }
    setKtonToStake(value);
  };

  const onSelectCollator = () => {
    if (selectCollatorModalRef.current) {
      selectCollatorModalRef.current.toggle();
    }
  };

  useEffect(() => {
    const freeDeposits = deposits?.filter((deposit) => !stakedDepositsIds?.includes(deposit.id)) ?? [];
    setStakeAbleDeposits(freeDeposits);
  }, [deposits, stakedDepositsIds]);

  useEffect(() => {
    if (typeof stakedAssetDistribution === "undefined" || typeof currentNominatedCollator === "undefined") {
      return;
    }
    const hasSomeStakingAmount =
      stakedAssetDistribution.ring.bonded.gt(0) ||
      (stakedAssetDistribution.ring.unbondingRing || []).length > 0 ||
      (stakedAssetDistribution.ring.totalOfDepositsInStaking || BN_ZERO).gt(0) ||
      (stakedAssetDistribution.ring.unbondingDeposits || []).length > 0 ||
      stakedAssetDistribution.kton.bonded.gt(0) ||
      (stakedAssetDistribution.kton.unbondingKton || []).length > 0;

    if (hasSomeStakingAmount || currentNominatedCollator) {
      setAccountIsStakingAlready(true);
    } else {
      setAccountIsStakingAlready(false);
    }
  }, [stakedAssetDistribution, currentNominatedCollator]);

  const depositRenderer = (option: Deposit) => {
    return (
      <div className={"flex justify-between"}>
        <div>ID#{option.id}</div>
        <div>
          <Tooltip message={<div>{formatBalance(option.value, { precision: 8 })}</div>}>
            {formatBalance(option.value)}
          </Tooltip>
        </div>
      </div>
    );
  };

  const onDepositSelectionChange = (selectedItem: Deposit, allSelectedItems: Deposit[]) => {
    /*totalSelectedRing value is already in Wei*/
    const totalSelectedRing = allSelectedItems.reduce((acc, deposit) => acc.add(deposit.value), BN_ZERO);
    const power = calculateExtraPower({
      ring: totalSelectedRing,
      kton: BN_ZERO,
    });
    setPowerByDeposits(power);
    setDepositsToStake(allSelectedItems);
  };

  const onCollatorSelected = (collator: Collator) => {
    setSelectedCollator(collator);
  };

  const onStartStaking = async () => {
    if (ringToStake.length > 0) {
      //user typed some ring value, validate it
      const isValidAmount = isValidNumber(ringToStake);
      if (!isValidAmount) {
        setRingHasError(true);
        notification.error({
          message: <div>{t(localeKeys.invalidRingAmount, { ringSymbol: chainConfig?.ring.symbol })}</div>,
        });
        return;
      }
    }
    if (ktonToStake.length > 0) {
      //user typed some kton, validate it
      const isValidAmount = isValidNumber(ktonToStake);
      if (!isValidAmount) {
        setKtonHasError(true);
        notification.error({
          message: <div>{t(localeKeys.invalidKtonAmount, { ktonSymbol: chainConfig?.kton.symbol })}</div>,
        });
        return;
      }
    }

    /*Check if the balances are enough*/
    const ringBigNumber = ringToStake.trim().length > 0 ? parseBalance(ringToStake.trim()) : BN_ZERO;
    const ktonBigNumber = ktonToStake.trim().length > 0 ? parseBalance(ktonToStake.trim()) : BN_ZERO;
    const ringThresholdBigNumber = parseBalance(minimumRingBalance.toString());

    if (!balance) {
      return;
    }

    if (ringBigNumber.gt(balance.ring)) {
      setRingHasError(true);
      notification.error({
        message: <div>{t(localeKeys.amountGreaterThanRingBalance, { ringSymbol: chainConfig?.ring.symbol })}</div>,
      });
      return;
    }

    /*The user MUST leave some RING that he'll use for the gas fee */
    if (balance.ring.sub(ringBigNumber).lt(ringThresholdBigNumber)) {
      setRingHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.leaveSomeGasFeeRing, {
              amount: minimumRingBalance,
              ringSymbol: chainConfig?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }

    if (ktonBigNumber.gt(balance.kton)) {
      setKtonHasError(true);
      notification.error({
        message: <div>{t(localeKeys.amountGreaterThanKtonBalance, { ktonSymbol: chainConfig?.kton.symbol })}</div>,
      });
      return;
    }

    try {
      if (!selectedCollator?.accountAddress) {
        notification.error({
          message: <div>{t(localeKeys.selectCollator)}</div>,
        });
        return;
      }
      const depositsIds = depositsToStake.map((item) => BigNumber.from(item.id));
      const isSuccessful = await stakeAndNominate(
        selectedCollator.accountAddress,
        ringBigNumber,
        ktonBigNumber,
        depositsIds
      );

      if (!isSuccessful) {
        notification.error({
          message: <div>{t(localeKeys.nominationUnsuccessful)}</div>,
        });
        return;
      }

      setDepositsToStake([]);
      setRingToStake("");
      setKtonToStake("");
      setPowerByRing(BN_ZERO);
      setPowerByKton(BN_ZERO);
      setPowerByDeposits(BN_ZERO);
      setSelectedCollator(undefined);
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      const error = processTransactionError(e as MetaMaskError);
      notification.error({
        message: <div>{error.message}</div>,
      });
      console.log(e);
    }
  };

  const getDepositsDropdown = () => {
    if (stakeAbleDeposits.length === 0) {
      return (
        <div className={"w-full border border-halfWhite bg-blackSecondary border-t-0"}>
          <div className={"bg-[rgba(255,255,255,0.2)] px-[10px] py-[6px] text-halfWhite"}>
            {t(localeKeys.noActiveDeposits)}
          </div>
        </div>
      );
    }
    return (
      <div
        className={
          "w-full border border-halfWhite border-t-0 bg-blackSecondary max-h-[310px] p-[10px] dw-custom-scrollbar"
        }
      >
        <CheckboxGroup
          options={stakeAbleDeposits}
          render={depositRenderer}
          onChange={onDepositSelectionChange}
          selectedOptions={depositsToStake}
        />
      </div>
    );
  };

  return (
    <div className={"flex flex-col gap-[20px]"}>
      {/*You can evaluate here what to show if the user can not stake*/}
      {!accountIsStakingAlready && (
        <div className={"card flex flex-col gap-[10px]"}>
          <div className={"text-14-bold"}>{t(localeKeys.delegate)}</div>
          <div className={"text-halfWhite text-12 divider border-b pb-[10px]"}>
            {t(localeKeys.stakingBasicInfo, {
              sessionTime: `${secondsToHumanTime(sessionDuration ?? 0, true).time} ${
                secondsToHumanTime(sessionDuration ?? 0, true).unit
              }`,
              unbondTime: `${secondsToHumanTime(unbondingDuration ?? 0).time} ${
                secondsToHumanTime(unbondingDuration ?? 0).unit
              }`,
            })}
          </div>
          <div className={"flex flex-col gap-[10px]"}>
            {!selectedCollator && (
              <Button
                onClick={() => {
                  onSelectCollator();
                }}
                className={"w-full"}
                btnType={"secondary"}
              >
                {t(localeKeys.selectCollator)}
              </Button>
            )}
            <SelectCollatorModal ref={selectCollatorModalRef} onCollatorSelected={onCollatorSelected} type={"set"} />
            {/*Selected collator*/}
            {selectedCollator && (
              <div className={"flex items-center gap-[10px] px-[15px] lg:px-[25px] lg:py-[20px] border border-primary"}>
                <div className={"shrink-0"}>
                  <JazzIcon size={30} address={selectedCollator.accountAddress ?? ""} />
                </div>
                <div className={"lg:flex lg:gap-[10px] min-w-0"}>
                  <div>{selectedCollator.accountName}</div>
                  <div>
                    <div className={"break-words"}>{selectedCollator.accountAddress}</div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    onSelectCollator();
                  }}
                  className={"shrink-0"}
                >
                  <img className={"w-[24px] clickable"} src={switchIcon} alt="image" />
                </div>
              </div>
            )}
            <div className={"flex flex-col lg:flex-row gap-[10px] divider border-b pb-[10px]"}>
              <div className={"flex-1 shrink-0"}>
                <Input
                  leftIcon={null}
                  value={ringToStake}
                  onChange={onRingToStakeChanged}
                  hasErrorMessage={false}
                  error={getRingValueErrorJSX()}
                  rightSlot={
                    <div className={"flex gap-[10px] items-center px-[10px]"}>
                      <img className={"w-[20px]"} src={ringTokenIcon} alt="image" />
                      <div className={"uppercase"}>{chainConfig?.ring.symbol ?? "RING"}</div>
                    </div>
                  }
                  placeholder={t(localeKeys.balanceAmount, {
                    amount: formatBalance(balance?.ring ?? BN_ZERO),
                  })}
                />
                <div className={"text-12-bold text-primary pt-[10px]"}>
                  +{prettifyNumber(powerByRing.toString())} {t(localeKeys.power)}
                </div>
              </div>
              <div className={"flex-1 shrink-0"}>
                <Input
                  leftIcon={null}
                  value={ktonToStake}
                  onChange={onKtonToStakeChanged}
                  hasErrorMessage={false}
                  error={getKtonValueErrorJSX()}
                  rightSlot={
                    <div className={"flex gap-[10px] items-center px-[10px]"}>
                      <img className={"w-[20px]"} src={ktonTokenIcon} alt="image" />
                      <div className={"uppercase"}>{chainConfig?.kton.symbol ?? "RING"}</div>
                    </div>
                  }
                  placeholder={t(localeKeys.balanceAmount, {
                    amount: formatBalance(balance?.kton ?? BN_ZERO),
                  })}
                />
                <div className={"text-12-bold text-primary pt-[10px]"}>
                  +{prettifyNumber(powerByKton.toString())} {t(localeKeys.power)}
                </div>
              </div>
              {/*use a deposit*/}
              <Dropdown
                closeOnInteraction={false}
                overlay={getDepositsDropdown()}
                triggerEvent={"click"}
                className={"flex-1 shrink-0"}
                dropdownClassName={"w-full top-[40px]"}
              >
                <div>
                  <div className={"flex-1 flex justify-between items-center border border-halfWhite px-[10px]"}>
                    <div className={"py-[7px]"}>
                      {depositsToStake.length === 0
                        ? t(localeKeys.useDeposit)
                        : t(localeKeys.depositSelected, { number: depositsToStake.length })}
                    </div>
                    <img className={"w-[16px]"} src={caretDownIcon} alt="image" />
                  </div>
                  <div className={"text-12-bold text-primary pt-[10px]"}>
                    +{prettifyNumber(powerByDeposits.toString())} {t(localeKeys.power)}
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
          <div className={"w-full flex flex-col lg:flex-row gap-[10px]"}>
            {/*<Button className={"w-full lg:w-auto !px-[55px]"}>
            {t(localeKeys.approveKton, { token: selectedNetwork?.kton.symbol })}
          </Button>*/}
            <Button
              onClick={onStartStaking}
              disabled={!canSubmitStakingForm()}
              className={"w-full lg:w-auto !px-[55px]"}
            >
              {t(localeKeys.stake)}
            </Button>
          </div>
        </div>
      )}
      <StakingRecords />
    </div>
  );
};
