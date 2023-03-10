import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { Button, CheckboxGroup, Dropdown, Input, notification, Tooltip } from "@darwinia/ui";
import ringIcon from "../../assets/images/ring.svg";
import ktonIcon from "../../assets/images/kton.svg";
import crabIcon from "../../assets/images/crab.svg";
import cktonIcon from "../../assets/images/ckton.svg";
import { useDispatch, useStorage, useWallet } from "@darwinia/app-providers";
import caretDownIcon from "../../assets/images/caret-down.svg";
import JazzIcon from "../JazzIcon";
import switchIcon from "../../assets/images/switch.svg";
import StakingRecordsTable from "../StakingRecordsTable";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Deposit, Collator } from "@darwinia/app-types";
import SelectCollatorModal, { SelectCollatorRefs } from "../SelectCollatorModal";
import {
  formatToWei,
  isValidNumber,
  prettifyNumber,
  prettifyTooltipNumber,
  secondsToHumanTime,
} from "@darwinia/app-utils";
import BigNumber from "bignumber.js";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber/lib/bignumber";

const StakingOverview = () => {
  const { t } = useAppTranslation();
  const { selectedNetwork, stakingContract, setTransactionStatus, provider } = useWallet();
  const {
    deposits,
    stakedDepositsIds,
    calculateExtraPower,
    balance,
    sessionDuration,
    unbondingDuration,
    stakedAssetDistribution,
    currentlyNominatedCollator,
  } = useStorage();
  const selectCollatorModalRef = useRef<SelectCollatorRefs>(null);
  const [selectedCollator, setSelectedCollator] = useState<Collator>();
  const [stakeAbleDeposits, setStakeAbleDeposits] = useState<Deposit[]>([]);
  const [depositsToStake, setDepositsToStake] = useState<Deposit[]>([]);
  const [ringToStake, setRingToStake] = useState<string>("");
  const [ktonToStake, setKtonToStake] = useState<string>("");
  const [ringHasError, setRingHasError] = useState<boolean>(false);
  const [ktonHasError, setKtonHasError] = useState<boolean>(false);
  const [powerByRing, setPowerByRing] = useState(BigNumber(0));
  const [powerByKton, setPowerByKton] = useState(BigNumber(0));
  const [powerByDeposits, setPowerByDeposits] = useState(BigNumber(0));
  const [accountIsStakingAlready, setAccountIsStakingAlready] = useState<boolean>(true);
  const { stakeAndNominate } = useDispatch();
  /*This is the minimum Ring balance that should be left on the account
   * for gas fee */
  const minimumRingBalance = 0;

  const ringTokenIcon = selectedNetwork?.name === "Crab" ? crabIcon : ringIcon;
  const ktonTokenIcon = selectedNetwork?.name === "Crab" ? cktonIcon : ktonIcon;

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
        ring: BigNumber(formatToWei(value).toString()),
        kton: BigNumber(0),
      });
      setPowerByRing(power);
    } else {
      setPowerByRing(BigNumber(0));
    }
    setRingToStake(value);
  };

  const onKtonToStakeChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKtonHasError(false);
    const value = event.target.value;
    const isValidAmount = isValidNumber(value);
    if (isValidAmount) {
      const power = calculateExtraPower({
        kton: BigNumber(formatToWei(value).toString()),
        ring: BigNumber(0),
      });
      setPowerByKton(power);
    } else {
      setPowerByKton(BigNumber(0));
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
    if (typeof stakedAssetDistribution === "undefined" || typeof currentlyNominatedCollator === "undefined") {
      return;
    }
    const hasSomeStakingAmount =
      stakedAssetDistribution.ring.bonded.gt(0) ||
      (stakedAssetDistribution.ring.unbondingRing || []).length > 0 ||
      (stakedAssetDistribution.ring.totalOfDepositsInStaking || BigNumber(0)).gt(0) ||
      (stakedAssetDistribution.ring.unbondingDeposits || []).length > 0 ||
      stakedAssetDistribution.kton.bonded.gt(0) ||
      (stakedAssetDistribution.kton.unbondingKton || []).length > 0;

    if (hasSomeStakingAmount || currentlyNominatedCollator) {
      setAccountIsStakingAlready(true);
    } else {
      setAccountIsStakingAlready(false);
    }
  }, [stakedAssetDistribution, currentlyNominatedCollator]);

  const depositRenderer = (option: Deposit) => {
    return (
      <div className={"flex justify-between"}>
        <div>ID#{option.id}</div>
        <div>
          <Tooltip message={<div>{prettifyTooltipNumber(option.value)}</div>}>
            {prettifyNumber({
              number: option.value,
            })}
          </Tooltip>
        </div>
      </div>
    );
  };

  const onDepositSelectionChange = (selectedItem: Deposit, allSelectedItems: Deposit[]) => {
    /*totalSelectedRing value is already in Wei*/
    const totalSelectedRing = allSelectedItems.reduce((acc, deposit) => acc.plus(deposit.value), BigNumber(0));
    const power = calculateExtraPower({
      kton: BigNumber(0),
      ring: BigNumber(totalSelectedRing.toString()),
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
          message: <div>{t(localeKeys.invalidRingAmount, { ringSymbol: selectedNetwork?.ring.symbol })}</div>,
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
          message: <div>{t(localeKeys.invalidKtonAmount, { ktonSymbol: selectedNetwork?.kton.symbol })}</div>,
        });
        return;
      }
    }

    /*Check if the balances are enough*/
    const ringBigNumber =
      ringToStake.trim().length > 0 ? BigNumber(formatToWei(ringToStake.trim()).toString()) : BigNumber(0);
    const ktonBigNumber =
      ktonToStake.trim().length > 0 ? BigNumber(formatToWei(ktonToStake.trim()).toString()) : BigNumber(0);
    const ringThresholdBigNumber = BigNumber(formatToWei(minimumRingBalance.toString()).toString());

    if (!balance) {
      return;
    }

    if (ringBigNumber.gt(balance.ring)) {
      setRingHasError(true);
      notification.error({
        message: <div>{t(localeKeys.amountGreaterThanRingBalance, { ringSymbol: selectedNetwork?.ring.symbol })}</div>,
      });
      return;
    }

    /*The user MUST leave some RING that he'll use for the gas fee */
    if (balance.ring.minus(ringBigNumber).lt(ringThresholdBigNumber)) {
      setRingHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.leaveSomeGasFeeRing, {
              amount: minimumRingBalance,
              ringSymbol: selectedNetwork?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }

    if (ktonBigNumber.gt(balance.kton)) {
      setKtonHasError(true);
      notification.error({
        message: <div>{t(localeKeys.amountGreaterThanKtonBalance, { ktonSymbol: selectedNetwork?.kton.symbol })}</div>,
      });
      return;
    }

    const ringEthersBigNumber =
      ringToStake.trim().length > 0 ? formatToWei(ringToStake.trim()) : EthersBigNumber.from(0);
    const ktonEthersBigNumber =
      ktonToStake.trim().length > 0 ? formatToWei(ktonToStake.trim()) : EthersBigNumber.from(0);

    try {
      if (!selectedCollator?.accountAddress) {
        notification.error({
          message: <div>{t(localeKeys.selectCollator)}</div>,
        });
        return;
      }
      const depositsIds = depositsToStake.map((item) => EthersBigNumber.from(item.id));
      setTransactionStatus(true);
      const isSuccessful = await stakeAndNominate({
        ringAmount: ringEthersBigNumber,
        ktonAmount: ktonEthersBigNumber,
        provider: provider,
        collatorAddress: selectedCollator?.accountAddress,
        depositIds: depositsIds,
      });

      setTransactionStatus(false);

      if (!isSuccessful) {
        notification.error({
          message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
        });
        return;
      }

      setDepositsToStake([]);
      setRingToStake("");
      setKtonToStake("");
      setPowerByRing(BigNumber(0));
      setPowerByKton(BigNumber(0));
      setPowerByDeposits(BigNumber(0));
      setSelectedCollator(undefined);
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setTransactionStatus(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
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
                      <div className={"uppercase"}>{selectedNetwork?.ring.symbol ?? "RING"}</div>
                    </div>
                  }
                  placeholder={t(localeKeys.balanceAmount, {
                    amount: prettifyNumber({
                      number: balance?.ring ?? BigNumber(0),
                      shouldFormatToEther: true,
                    }),
                  })}
                />
                <div className={"text-12-bold text-primary pt-[10px]"}>
                  +
                  {prettifyNumber({
                    number: powerByRing,
                    precision: 0,
                    shouldFormatToEther: false,
                  })}{" "}
                  {t(localeKeys.power)}
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
                      <div className={"uppercase"}>{selectedNetwork?.kton.symbol ?? "RING"}</div>
                    </div>
                  }
                  placeholder={t(localeKeys.balanceAmount, {
                    amount: prettifyNumber({
                      number: balance?.kton ?? BigNumber(0),
                      shouldFormatToEther: true,
                    }),
                  })}
                />
                <div className={"text-12-bold text-primary pt-[10px]"}>
                  +
                  {prettifyNumber({
                    number: powerByKton,
                    precision: 0,
                    shouldFormatToEther: false,
                  })}{" "}
                  {t(localeKeys.power)}
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
                    +
                    {prettifyNumber({
                      number: powerByDeposits,
                      precision: 0,
                      shouldFormatToEther: false,
                    })}{" "}
                    {t(localeKeys.power)}
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
      <StakingRecordsTable />
    </div>
  );
};

export default StakingOverview;
