import {
  Button,
  Column,
  Table,
  Tooltip,
  Popover,
  ModalEnhanced,
  Input,
  CheckboxGroup,
  notification,
} from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { useStorage, useWallet } from "@darwinia/app-providers";
import JazzIcon from "../JazzIcon";
import warningIcon from "../../assets/images/warning.svg";
import plusIcon from "../../assets/images/plus-square.svg";
import minusIcon from "../../assets/images/minus-square.svg";
import helpIcon from "../../assets/images/help.svg";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Deposit, Delegate, UnbondingAsset } from "@darwinia/app-types";
import { formatToWei, isValidNumber, prettifyNumber, secondsToHumanTime } from "@darwinia/app-utils";
import BigNumber from "bignumber.js";
import { BigNumber as EthersBigNumber } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";
import SelectCollatorModal, { SelectCollatorRefs } from "../SelectCollatorModal";

interface RestakeParams {
  ringEthersBigNumber: EthersBigNumber;
  ktonEthersBigNumber: EthersBigNumber;
  depositsIds: EthersBigNumber[];
}

const amountPrecision = 6;

const StakingRecordsTable = () => {
  const selectCollatorModalRef = useRef<SelectCollatorRefs>(null);
  const { t } = useAppTranslation();
  const { selectedNetwork, stakingContract, setTransactionStatus } = useWallet();
  const { stakedAssetDistribution, isLoadingLedger, setNewUserIntroStakingValues } = useStorage();
  const [showBondTokenModal, setShowBondTokenModal] = useState<boolean>(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState<boolean>(false);
  const [showBondDepositModal, setShowBondDepositModal] = useState<boolean>(false);
  const [bondModalType, setBondModalType] = useState<BondModalType>("bondMore");
  const [isUpdatingRing, setIsUpdatingRing] = useState(false);
  const [tokenSymbolToUpdate, setTokenSymbolToUpdate] = useState<string>("RING");
  const delegateToUpdate = useRef<Delegate | null>(null);
  const { deposits, stakedDepositsIds, calculatePower, currentlyNominatedCollator } = useStorage();
  const [dataSource, setDataSource] = useState<Delegate[]>([]);

  const onCloseBondTokenModal = () => {
    delegateToUpdate.current = null;
    setShowBondTokenModal(false);
  };

  const onCloseUndelegateModal = () => {
    setShowUndelegateModal(false);
  };

  const onCloseBondDepositModal = () => {
    delegateToUpdate.current = null;
    setShowBondDepositModal(false);
  };

  const onShowBondTokenModal = (modalType: BondModalType, delegate: Delegate, symbol: string, isRing: boolean) => {
    delegateToUpdate.current = delegate;
    setTokenSymbolToUpdate(symbol);
    setIsUpdatingRing(isRing);
    setBondModalType(modalType);
    setShowBondTokenModal(true);
  };

  const onShowBondDepositModal = (modalType: BondModalType, delegate: Delegate) => {
    delegateToUpdate.current = delegate;
    setBondModalType(modalType);
    setShowBondDepositModal(true);
  };

  const onShowUndelegateModal = (delegate: Delegate) => {
    delegateToUpdate.current = delegate;
    // trigger click to auto close the popover
    document.body.click();
    setShowUndelegateModal(true);
  };

  const onUnbondAll = async () => {
    try {
      setTransactionStatus(true);
      const ringBigNumber = stakedAssetDistribution?.ring.bonded ?? BigNumber(0);
      const ktonBigNumber = stakedAssetDistribution?.kton.bonded ?? BigNumber(0);
      const ringEthersBigNumber = EthersBigNumber.from(ringBigNumber.toString());
      const ktonEthersBigNumber = EthersBigNumber.from(ktonBigNumber.toString());
      const depositsIds = stakedDepositsIds?.map((id) => EthersBigNumber.from(id)) ?? [];
      const response = (await stakingContract?.unstake(
        ringEthersBigNumber,
        ktonEthersBigNumber,
        depositsIds
      )) as TransactionResponse;
      await response.wait(1);
      setTransactionStatus(false);
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setTransactionStatus(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  const onConfirmBondToken = () => {
    setShowBondTokenModal(false);
  };

  const onConfirmUndelegation = () => {
    setShowUndelegateModal(false);
  };

  const onConfirmBondDeposit = () => {
    setShowBondDepositModal(false);
  };

  const reStake = async ({ ringEthersBigNumber, ktonEthersBigNumber, depositsIds }: RestakeParams) => {
    try {
      setTransactionStatus(true);
      const response = (await stakingContract?.restake(
        ringEthersBigNumber,
        ktonEthersBigNumber,
        depositsIds
      )) as TransactionResponse;
      await response.wait(1);
      setTransactionStatus(false);
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setTransactionStatus(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  const onCancelDepositUnbonding = (depositId: number) => {
    const ringAmount = EthersBigNumber.from(0);
    const ktonAmount = EthersBigNumber.from(0);
    const depositIds: EthersBigNumber[] = [EthersBigNumber.from(depositId)];
    reStake({
      ringEthersBigNumber: ringAmount,
      ktonEthersBigNumber: ktonAmount,
      depositsIds: depositIds,
    });
  };

  const onCancelTokenUnbonding = (amount: BigNumber, isRing: boolean) => {
    const ringAmount = isRing ? EthersBigNumber.from(amount.toString()) : EthersBigNumber.from(0);
    const ktonAmount = isRing ? EthersBigNumber.from(0) : EthersBigNumber.from(amount.toString());
    const depositIds: EthersBigNumber[] = [];
    reStake({
      ringEthersBigNumber: ringAmount,
      ktonEthersBigNumber: ktonAmount,
      depositsIds: depositIds,
    });
  };

  const onReleaseTokenOrDeposit = async () => {
    try {
      setTransactionStatus(true);
      const response = (await stakingContract?.claim()) as TransactionResponse;
      await response.wait(1);
      setTransactionStatus(false);
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setTransactionStatus(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  const onShowSelectCollatorModal = () => {
    selectCollatorModalRef.current?.toggle();
  };

  const onCollatorSelected = () => {
    selectCollatorModalRef.current?.toggle();
  };

  useEffect(() => {
    if (!selectedNetwork || !stakedAssetDistribution) {
      return;
    }
    const stakedRing = stakedAssetDistribution.ring.bonded;
    const totalOfStakedDeposits = stakedAssetDistribution.ring.totalOfDepositsInStaking ?? BigNumber(0);
    /* This is supposed to be the total amount of power invested in a certain collator
     * but for now since the user can only choose one collator, here it will only show the
     * total power that has been used in staking */
    const totalStakedPower = calculatePower({
      kton: stakedAssetDistribution.kton.bonded,
      ring: stakedRing.plus(totalOfStakedDeposits),
    });

    const hasSomeStakingAmount =
      stakedAssetDistribution.ring.bonded.gt(0) ||
      (stakedAssetDistribution.ring.unbondingRing || []).length > 0 ||
      (stakedAssetDistribution.ring.totalOfDepositsInStaking || BigNumber(0)).gt(0) ||
      (stakedAssetDistribution.ring.unbondingDeposits || []).length > 0 ||
      stakedAssetDistribution.kton.bonded.gt(0) ||
      (stakedAssetDistribution.kton.unbondingKton || []).length > 0;

    const hasSomeUnbondingAmount =
      (stakedAssetDistribution.ring.unbondingRing || []).length > 0 ||
      (stakedAssetDistribution.ring.unbondingDeposits || []).length > 0 ||
      (stakedAssetDistribution.kton.unbondingKton || []).length > 0;

    if (!hasSomeStakingAmount && !currentlyNominatedCollator) {
      setDataSource([]);
      return;
    }

    const accountNeedsACollator = hasSomeStakingAmount && !currentlyNominatedCollator;

    if (accountNeedsACollator) {
      /* This will be used to show the staked values in the introduction layout */
      setNewUserIntroStakingValues({
        ringAmount: stakedAssetDistribution.ring.bonded,
        ktonAmount: stakedAssetDistribution.kton.bonded,
        depositAmount: stakedAssetDistribution.ring.totalOfDepositsInStaking ?? BigNumber(0),
        totalPower: totalStakedPower,
      });
    } else {
      setNewUserIntroStakingValues(undefined);
    }

    setDataSource([
      {
        id: currentlyNominatedCollator?.accountAddress ?? "1",
        collator: currentlyNominatedCollator?.accountName || currentlyNominatedCollator?.accountAddress,
        staked: totalStakedPower,
        isActive: currentlyNominatedCollator?.isActive,
        accountNeedsACollator: accountNeedsACollator,
        canUnbondAll: !hasSomeUnbondingAmount,
        bondedTokens: [
          {
            amount: stakedAssetDistribution.ring.bonded,
            symbol: selectedNetwork?.ring.symbol ?? "",
            isRingBonding: true,
            unbondingRing: stakedAssetDistribution.ring.unbondingRing,
          },
          {
            amount: stakedAssetDistribution.ring.totalOfDepositsInStaking ?? BigNumber(0),
            symbol: selectedNetwork?.ring.symbol ?? "",
            isDeposit: true,
            unbondingDeposits: stakedAssetDistribution.ring.unbondingDeposits,
          },
          {
            amount: stakedAssetDistribution.kton.bonded,
            symbol: selectedNetwork?.kton.symbol ?? "",
            isKtonBonding: true,
            unbondingKton: stakedAssetDistribution.kton.unbondingKton,
          },
        ],
      },
    ]);
  }, [selectedNetwork, stakedAssetDistribution, currentlyNominatedCollator]);

  const columns: Column<Delegate>[] = [
    {
      id: "1",
      title: <div>{t(localeKeys.collator)}</div>,
      key: "collator",
      render: (row) => {
        if (row.accountNeedsACollator) {
          return (
            <Button
              onClick={() => {
                onShowSelectCollatorModal();
              }}
              btnType={"secondary"}
              className={"!px-[15px] !h-[30px] select-collator-btn"}
            >
              {t(localeKeys.selectCollator)}
            </Button>
          );
        }
        return (
          <div className={"flex gap-[5px] items-center"}>
            <JazzIcon size={30} address={row.collator ?? ""} />
            <div className={"flex-ellipsis"}>
              <div>{row.collator}</div>
            </div>
            {row.isActive ? null : (
              <Tooltip className={"shrink-0"} message={t(localeKeys.waitingCollatorWarning)}>
                <img className={"w-[21px] shrink-0"} src={warningIcon} alt="image" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      id: "2",
      title: <div>{t(localeKeys.youStaked)}</div>,
      key: "staked",
      width: "250px",
      render: (row) => {
        if (row.accountNeedsACollator) {
          return (
            <div className={"flex items-center gap-[10px]"}>
              <div className={"text-halfWhite"}>
                {prettifyNumber({
                  number: row.staked,
                  precision: 0,
                  shouldFormatToEther: false,
                })}
              </div>
              <Tooltip message={t(localeKeys.powerNotWorking)}>
                <img className={"w-[20px]"} src={helpIcon} alt="image" />
              </Tooltip>
            </div>
          );
        }

        return (
          <div>
            {prettifyNumber({
              number: row.staked,
              precision: 0,
              shouldFormatToEther: false,
            })}
          </div>
        );
      },
    },
    {
      id: "4",
      title: <div className={"bonded-tokens"}>{t(localeKeys.yourBondedTokens)}</div>,
      key: "bondedTokens",
      render: (row) => {
        let hasAnyUnbondingItem = false;
        row.bondedTokens.forEach((item) => {
          if (item.unbondingDeposits?.length || item?.unbondingRing?.length || item?.unbondingKton?.length) {
            hasAnyUnbondingItem = true;
          }
        });
        return (
          <div>
            {row.bondedTokens.map((item, index) => {
              let message: JSX.Element = <div />;
              let hasSomeUnbondingItems = false;
              /*Create the message JSX for deposits that are ready to be released and the ones that aren't ready to be released */
              if (item.isDeposit) {
                hasSomeUnbondingItems = !!item?.unbondingDeposits?.length;
                const depositsNotReadyToBeReleased = item.unbondingDeposits?.filter((item) => !item.isExpired) ?? [];
                const depositsReadyToBeReleased = item.unbondingDeposits?.filter((item) => item.isExpired) ?? [];
                // create a message for unbonding deposits
                message = (
                  <div className={"flex flex-col gap-[10px] text-14-bold !text-[10px] !leading-[15px]"}>
                    {depositsNotReadyToBeReleased.map((asset, index) => {
                      return (
                        <div key={index}>
                          {t(localeKeys.depositsToBeReleased, {
                            amount: prettifyNumber({
                              number: asset.amount,
                              precision: amountPrecision,
                              keepTrailingZeros: false,
                              shouldFormatToEther: true,
                            }),
                            ringSymbol: selectedNetwork?.ring.symbol,
                            timeLeft: asset.expiredHumanTime,
                          })}
                          <span
                            onClick={() => {
                              if (!asset.depositId) {
                                return;
                              }
                              onCancelDepositUnbonding(asset.depositId);
                            }}
                            className={"text-primary pl-[8px] clickable"}
                          >
                            {t(localeKeys.cancelUnbonding)}
                          </span>
                        </div>
                      );
                    })}

                    {depositsReadyToBeReleased.map((asset, index) => {
                      return (
                        <div key={index}>
                          {t(localeKeys.depositsReadyToRelease, {
                            amount: prettifyNumber({
                              number: asset.amount,
                              precision: amountPrecision,
                              keepTrailingZeros: false,
                              shouldFormatToEther: true,
                            }),
                            ringSymbol: selectedNetwork?.ring.symbol,
                          })}
                          <span
                            onClick={() => {
                              onReleaseTokenOrDeposit();
                            }}
                            className={"text-primary clickable"}
                          >
                            &nbsp;{t(localeKeys.releaseThem)}&nbsp;
                          </span>
                          {t(localeKeys.toTermDeposit)}
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                /*Create the message JSX for RINGs and KTONs that are ready to be released and the ones that aren't ready to be released */
                let unbondingAsset: UnbondingAsset[] = [];
                if (item.isRingBonding) {
                  unbondingAsset = item?.unbondingRing ?? [];
                  hasSomeUnbondingItems = !!item?.unbondingRing?.length;
                } else if (item.isKtonBonding) {
                  unbondingAsset = item?.unbondingKton ?? [];
                  hasSomeUnbondingItems = !!item?.unbondingKton?.length;
                }
                const assetsNotReadyToBeReleased = unbondingAsset.filter((item) => !item.isExpired);
                const assetsReadyToBeReleased = unbondingAsset.filter((item) => item.isExpired);
                // create a message for unbonding RING
                message = (
                  <div className={"flex flex-col gap-[10px] text-14-bold !text-[10px] !leading-[15px]"}>
                    {assetsNotReadyToBeReleased.map((asset, index) => {
                      return (
                        <div key={index}>
                          {t(localeKeys.tokensToBeReleased, {
                            amount: prettifyNumber({
                              number: asset.amount,
                              precision: amountPrecision,
                              keepTrailingZeros: false,
                              shouldFormatToEther: true,
                            }),
                            token: item.isRingBonding ? selectedNetwork?.ring.symbol : selectedNetwork?.kton.symbol,
                            timeLeft: asset.expiredHumanTime,
                          })}
                          <span
                            onClick={() => {
                              onCancelTokenUnbonding(asset.amount, !!item.isRingBonding);
                            }}
                            className={"text-primary pl-[8px] clickable"}
                          >
                            {t(localeKeys.cancelUnbonding)}
                          </span>
                        </div>
                      );
                    })}

                    {assetsReadyToBeReleased.map((asset, index) => {
                      return (
                        <div key={index}>
                          {t(localeKeys.tokensReadyToRelease, {
                            amount: prettifyNumber({
                              number: asset.amount,
                              precision: amountPrecision,
                              keepTrailingZeros: false,
                              shouldFormatToEther: true,
                            }),
                            token: item.isRingBonding ? selectedNetwork?.ring.symbol : selectedNetwork?.kton.symbol,
                          })}
                          <span
                            onClick={() => {
                              onReleaseTokenOrDeposit();
                            }}
                            className={"text-primary pl-[8px] clickable"}
                          >
                            {t(localeKeys.releaseNow)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              const bondJSX = (
                <div
                  className={`flex gap-[5px] ${hasSomeUnbondingItems ? "text-halfWhite cursor-default" : "text-white"}`}
                >
                  <div className={"relative"}>
                    {hasSomeUnbondingItems && (
                      <img
                        className={"w-[15px] absolute z-10 left-0 top-[50%] -translate-y-1/2"}
                        src={helpIcon}
                        alt="image"
                      />
                    )}
                    <div className={`${hasAnyUnbondingItem ? "pl-[20px]" : ""}`}>
                      {prettifyNumber({
                        number: item.amount,
                        precision: amountPrecision,
                        shouldFormatToEther: true,
                      })}{" "}
                      {item.isDeposit ? t(localeKeys.deposit) : ""} {item.symbol.toUpperCase()}
                    </div>
                  </div>
                  {row.accountNeedsACollator ? null : (
                    <div className={"flex items-center"}>
                      <div className={"flex gap-[5px]"}>
                        <img
                          onClick={() => {
                            if (item.isDeposit) {
                              onShowBondDepositModal("bondMore", row);
                              return;
                            }
                            onShowBondTokenModal("bondMore", row, item.symbol, !!item.isRingBonding);
                          }}
                          src={plusIcon}
                          className={"clickable w-[16px]"}
                          alt="image"
                        />
                        <img
                          onClick={() => {
                            if (item.isDeposit) {
                              onShowBondDepositModal("unbond", row);
                              return;
                            }
                            onShowBondTokenModal("unbond", row, item.symbol, !!item.isRingBonding);
                          }}
                          src={minusIcon}
                          className={"clickable w-[16px]"}
                          alt="image"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
              return (
                <div className={"flex"} key={`${row.collator}-${index}`}>
                  {hasSomeUnbondingItems ? (
                    <Tooltip extendTriggerToPopover={true} offset={[0, 0]} message={message}>
                      {bondJSX}
                    </Tooltip>
                  ) : (
                    bondJSX
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      id: "5",
      title: <div>{t(localeKeys.actions)}</div>,
      key: "collator",
      width: "300px",
      render: (row) => {
        if (row.accountNeedsACollator) {
          return (
            <Button
              onClick={() => {
                onUnbondAll();
              }}
              disabled={!row.canUnbondAll}
              btnType={"secondary"}
              className={"!px-[15px] !h-[30px] unbond-all-btn"}
            >
              {t(localeKeys.unbondAll)}
            </Button>
          );
        }

        const options = (
          <div className={"flex items-end flex-col gap-[5px]"}>
            <Button
              onClick={() => {
                onShowUndelegateModal(row);
              }}
              btnType={"secondary"}
            >
              {t(localeKeys.undelegate)}
            </Button>
          </div>
        );
        return (
          <div className={"flex gap-[10px]"}>
            <Button
              onClick={() => {
                onShowSelectCollatorModal();
              }}
              className={"!h-[36px] !px-[15px]"}
              btnType={"secondary"}
            >
              {t(localeKeys.changeCollator)}
            </Button>
            <MoreOptions options={options} />
          </div>
        );
      },
    },
  ];

  return (
    <div className={"flex flex-col"}>
      <div className={"flex flex-col"}>
        <Table
          isLoading={isLoadingLedger}
          headerSlot={<div className={"text-14-bold pb-[10px]"}>{t(localeKeys.stakingDelegation)}</div>}
          noDataText={t(localeKeys.noDelegation)}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
      <SelectCollatorModal ref={selectCollatorModalRef} onCollatorSelected={onCollatorSelected} type={"update"} />
      <BondTokenModal
        delegateToUpdate={delegateToUpdate.current}
        symbol={tokenSymbolToUpdate}
        isUpdatingRing={isUpdatingRing}
        onCancel={onCloseBondTokenModal}
        onConfirm={onConfirmBondToken}
        type={bondModalType}
        isVisible={showBondTokenModal}
        onClose={onCloseBondTokenModal}
      />
      <BondDepositModal
        bondedDeposits={stakedDepositsIds ?? []}
        allDeposits={deposits ?? []}
        onCancel={onCloseBondDepositModal}
        onConfirm={onConfirmBondDeposit}
        type={bondModalType}
        isVisible={showBondDepositModal}
        onClose={onCloseBondDepositModal}
      />
      <UndelegationModal
        onCancel={onCloseUndelegateModal}
        onConfirm={onConfirmUndelegation}
        isVisible={showUndelegateModal}
        onClose={onCloseUndelegateModal}
      />
    </div>
  );
};

export default StakingRecordsTable;

interface MoreOptionsProps {
  options: JSX.Element;
}

const MoreOptions = ({ options }: MoreOptionsProps) => {
  const [moreOptionsTrigger, setMoreOptionsTrigger] = useState<HTMLButtonElement | null>(null);
  return (
    <>
      <Button ref={setMoreOptionsTrigger} className={"!h-[36px] !px-[15px]"} btnType={"secondary"}>
        ...
      </Button>
      <Popover triggerElementState={moreOptionsTrigger} triggerEvent={"click"}>
        <div>{options}</div>
      </Popover>
    </>
  );
};

type BondModalType = "bondMore" | "unbond";

interface BondTokenProps {
  isUpdatingRing: boolean;
  type: BondModalType;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  symbol: string;
  delegateToUpdate: Delegate | null;
}

/*Bond more or less tokens*/
const BondTokenModal = ({
  isVisible,
  type,
  onClose,
  onConfirm,
  onCancel,
  symbol,
  isUpdatingRing,
  delegateToUpdate,
}: BondTokenProps) => {
  const { t } = useAppTranslation();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const { balance, calculateExtraPower, unbondingDuration } = useStorage();
  const { selectedNetwork } = useWallet();
  const [power, setPower] = useState<BigNumber>(BigNumber(0));
  const { stakingContract } = useWallet();
  const unbondingTime = secondsToHumanTime(unbondingDuration ?? 0);

  const getErrorJSX = () => {
    return hasError ? <div /> : null;
  };

  const balanceAmount: BigNumber = isUpdatingRing ? balance?.ring ?? BigNumber(0) : balance?.kton ?? BigNumber(0);
  const bondedRing: BigNumber =
    delegateToUpdate?.bondedTokens?.find((item) => item.isRingBonding)?.amount ?? BigNumber(0);
  const bondedKton: BigNumber =
    delegateToUpdate?.bondedTokens?.find((item) => item.isKtonBonding)?.amount ?? BigNumber(0);
  const bondedAmount: BigNumber = isUpdatingRing ? bondedRing : bondedKton;
  const bondMorePlaceholder = t(localeKeys.balanceAmount, {
    amount: prettifyNumber({
      number: balanceAmount,
      precision: amountPrecision,
      shouldFormatToEther: true,
    }),
  });
  const unbondPlaceholder = t(localeKeys.bondedAmount, {
    amount: prettifyNumber({
      number: bondedAmount,
      precision: amountPrecision,
      shouldFormatToEther: true,
    }),
  });

  useEffect(() => {
    setValue("");
    setPower(BigNumber(0));
    setLoading(false);
    setHasError(false);
  }, [isVisible]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasError(false);
    const value = event.target.value;
    const isValidAmount = isValidNumber(value);
    if (isValidAmount) {
      const ringBigNumber = isUpdatingRing ? BigNumber(formatToWei(value).toString()) : BigNumber(0);
      const ktonBigNumber = isUpdatingRing ? BigNumber(0) : BigNumber(formatToWei(value).toString());
      const power = calculateExtraPower({
        ring: ringBigNumber,
        kton: ktonBigNumber,
      });
      setPower(power);
    } else {
      setPower(BigNumber(0));
    }
    setValue(event.target.value);
  };

  const onConfirmBonding = async () => {
    const isValidAmount = isValidNumber(value);
    if (!isValidAmount) {
      if (isUpdatingRing) {
        notification.error({
          message: <div>{t(localeKeys.invalidRingAmount, { ringSymbol: selectedNetwork?.ring.symbol })}</div>,
        });
      } else {
        notification.error({
          message: <div>{t(localeKeys.invalidKtonAmount, { ktonSymbol: selectedNetwork?.kton.symbol })}</div>,
        });
      }
      setHasError(true);
      return;
    }
    let ringEthersBigNumber = EthersBigNumber.from(0);
    let ktonEthersBigNumber = EthersBigNumber.from(0);
    const depositsIds: EthersBigNumber[] = [];
    if (isUpdatingRing) {
      //the user is trying to update his ring bond
      ringEthersBigNumber = formatToWei(value);
      if (type === "bondMore") {
        //make sure that the user doesn't bond more than his balance
        const valueInWei = formatToWei(value).toString();
        if (BigNumber(valueInWei).gt(balanceAmount)) {
          notification.error({
            message: (
              <div>
                {t(localeKeys.bondAmountMaxError, {
                  amount: prettifyNumber({
                    number: balanceAmount,
                    shouldFormatToEther: true,
                    precision: amountPrecision,
                  }),
                  tokenSymbol: selectedNetwork?.ring.symbol,
                })}
              </div>
            ),
          });
          return;
        }
      } else {
        //make sure that the user doesn't unbond more than what he bonded
        const valueInWei = formatToWei(value).toString();
        if (BigNumber(valueInWei).gt(bondedAmount)) {
          notification.error({
            message: (
              <div>
                {t(localeKeys.unbondAmountMaxError, {
                  amount: prettifyNumber({
                    number: bondedAmount,
                    shouldFormatToEther: true,
                    precision: amountPrecision,
                  }),
                  tokenSymbol: selectedNetwork?.ring.symbol,
                })}
              </div>
            ),
          });
          return;
        }
      }
    } else {
      // the user is trying to update kton deposits
      ktonEthersBigNumber = formatToWei(value);
      // in here balanceAmount is some KTON not RING
      if (type === "bondMore") {
        //make sure that the user doesn't bond more than his balance
        const valueInWei = formatToWei(value).toString();
        if (BigNumber(valueInWei).gt(balanceAmount)) {
          notification.error({
            message: (
              <div>
                {t(localeKeys.bondAmountMaxError, {
                  amount: prettifyNumber({
                    number: balanceAmount,
                    shouldFormatToEther: true,
                    precision: amountPrecision,
                  }),
                  tokenSymbol: selectedNetwork?.kton.symbol,
                })}
              </div>
            ),
          });
          return;
        }
      } else {
        //make sure that the user doesn't unbond more than what he bonded
        const valueInWei = formatToWei(value).toString();
        if (BigNumber(valueInWei).gt(bondedAmount)) {
          notification.error({
            message: (
              <div>
                {t(localeKeys.unbondAmountMaxError, {
                  amount: prettifyNumber({
                    number: bondedAmount,
                    shouldFormatToEther: true,
                    precision: amountPrecision,
                  }),
                  tokenSymbol: selectedNetwork?.kton.symbol,
                })}
              </div>
            ),
          });
          return;
        }
      }
    }

    try {
      setLoading(true);
      const promise = (
        type === "bondMore"
          ? stakingContract?.stake(ringEthersBigNumber, ktonEthersBigNumber, depositsIds)
          : stakingContract?.unstake(ringEthersBigNumber, ktonEthersBigNumber, depositsIds)
      ) as Promise<TransactionResponse>;
      const response = await promise;
      await response.wait(1);
      setLoading(false);
      onConfirm();
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setLoading(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  return (
    <ModalEnhanced
      modalTitle={
        type === "bondMore"
          ? t(localeKeys.bondMoreToken, { tokenSymbol: symbol.toUpperCase() })
          : t(localeKeys.unbondToken, { tokenSymbol: symbol.toUpperCase() })
      }
      cancelText={t(localeKeys.cancel)}
      confirmText={type === "bondMore" ? t(localeKeys.bond) : t(localeKeys.unbond)}
      onConfirm={onConfirmBonding}
      isLoading={isLoading}
      isCancellable={false}
      isVisible={isVisible}
      onClose={onClose}
      onCancel={onCancel}
      className={"!max-w-[400px]"}
      confirmDisabled={value === ""}
    >
      <div className={"divider border-b pb-[15px]"}>
        {type === "unbond" && (
          <div className={"pb-[20px] mb-[20px] divider border-b text-12"}>
            {t(localeKeys.unbondTimeInfo, { unbondingTime: `${unbondingTime.time} ${unbondingTime.unit}` })}
          </div>
        )}
        <div className={"flex flex-col gap-[10px]"}>
          <div className={"text-12-bold"}>{t(localeKeys.amount)}</div>
          <Input
            value={value}
            onChange={onInputChange}
            hasErrorMessage={false}
            error={getErrorJSX()}
            bottomTip={
              <div className={"text-primary"}>
                {type === "bondMore" ? "+" : "-"}
                {prettifyNumber({
                  number: power,
                  precision: 0,
                  shouldFormatToEther: false,
                })}{" "}
                {t(localeKeys.power)}
              </div>
            }
            leftIcon={null}
            placeholder={type === "bondMore" ? bondMorePlaceholder : unbondPlaceholder}
            rightSlot={<div className={"flex items-center px-[10px]"}>{symbol}</div>}
          />
        </div>
      </div>
    </ModalEnhanced>
  );
};

interface BondDepositProps {
  type: BondModalType;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  allDeposits: Deposit[];
  bondedDeposits: number[];
}

/*Bond more or less deposits*/
const BondDepositModal = ({
  isVisible,
  type,
  onClose,
  onConfirm,
  onCancel,
  bondedDeposits,
  allDeposits,
}: BondDepositProps) => {
  const { t } = useAppTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedDeposits, setSelectedDeposit] = useState<Deposit[]>([]);
  const [powerByDeposits, setPowerByDeposits] = useState(BigNumber(0));
  const [renderDeposits, setRenderDeposits] = useState<Deposit[]>([]);
  const { stakingContract } = useWallet();
  const { unbondingDuration, calculateExtraPower } = useStorage();
  const unbondingTime = secondsToHumanTime(unbondingDuration ?? 0);

  useEffect(() => {
    setSelectedDeposit([]);
    setLoading(false);
    setPowerByDeposits(BigNumber(0));
    setSelectedDeposit([]);
    let deposits: Deposit[] = [];
    if (type === "bondMore") {
      /* filter out all deposits that have already been bonded, only take the unbonded deposits */
      deposits = allDeposits.filter((item) => {
        /* only take the deposit if it is not in use, this is the right way to evaluate since the unstaking/unbonding
        deposits are also in use. This will avoid showing the unbonding deposits for rebonding them */
        return !item.inUse;
      });
    } else {
      /*show bonded deposits so that the user can check them to unbond them, this is the right way to evaluate since if
       * we use the inUse property we may end up with some deposits that are unbonding. DO NOT allow
       * users to re-unbond the deposits that are already unbonding */
      deposits = allDeposits.filter((item) => {
        return bondedDeposits.includes(item.id);
      });
    }
    setRenderDeposits(deposits);
  }, [isVisible]);

  const depositRenderer = (option: Deposit) => {
    return (
      <div className={"flex justify-between"}>
        <div>ID#{option.id}</div>
        <div>
          {prettifyNumber({
            number: option.value,
            precision: amountPrecision,
          })}
        </div>
      </div>
    );
  };

  const onDepositSelectionChange = (selectedItem: Deposit, allItems: Deposit[]) => {
    /*totalSelectedRing value is already in Wei*/
    const totalSelectedRing = allItems.reduce((acc, deposit) => acc.plus(deposit.value), BigNumber(0));
    const power = calculateExtraPower({
      kton: BigNumber(0),
      ring: BigNumber(totalSelectedRing.toString()),
    });
    setPowerByDeposits(power);
    setSelectedDeposit(allItems);
  };

  const onConfirmBonding = async () => {
    const ringEthersBigNumber = EthersBigNumber.from(0);
    const ktonEthersBigNumber = EthersBigNumber.from(0);
    const depositsIds = selectedDeposits.map((item) => EthersBigNumber.from(item.id));

    try {
      setLoading(true);
      const promise = (
        type === "bondMore"
          ? stakingContract?.stake(ringEthersBigNumber, ktonEthersBigNumber, depositsIds)
          : stakingContract?.unstake(ringEthersBigNumber, ktonEthersBigNumber, depositsIds)
      ) as Promise<TransactionResponse>;
      const response = await promise;
      await response.wait(1);
      setLoading(false);
      onConfirm();
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setLoading(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  return (
    <ModalEnhanced
      modalTitle={type === "bondMore" ? t(localeKeys.bondMoreDeposits) : t(localeKeys.unbondDeposits)}
      cancelText={t(localeKeys.cancel)}
      confirmText={type === "bondMore" ? t(localeKeys.bond) : t(localeKeys.unbond)}
      onConfirm={onConfirmBonding}
      isCancellable={false}
      isLoading={isLoading}
      isVisible={isVisible}
      onClose={onClose}
      onCancel={onCancel}
      confirmDisabled={selectedDeposits.length === 0}
      className={"!max-w-[400px]"}
    >
      <div className={"flex flex-col"}>
        <div className={"divider border-b pb-[20px]"}>
          {type === "unbond" && (
            <div className={"pb-[20px] mb-[20px] divider border-b text-12"}>
              {t(localeKeys.unbondTimeInfo, { unbondingTime: `${unbondingTime.time} ${unbondingTime.unit}` })}
            </div>
          )}
          <div className={"flex flex-col gap-[10px] max-h-[300px] dw-custom-scrollbar"}>
            {renderDeposits.length === 0 ? (
              <div className={"text-12"}>
                {type === "bondMore" ? t(localeKeys.noMoreDepositsToBond) : t(localeKeys.noDepositsToUnbond)}
              </div>
            ) : (
              <CheckboxGroup
                options={renderDeposits}
                render={depositRenderer}
                onChange={onDepositSelectionChange}
                selectedOptions={selectedDeposits}
              />
            )}
          </div>
        </div>
        <div className={"text-12-bold text-primary pt-[10px]"}>
          {type === "bondMore" ? "+" : "-"}
          {prettifyNumber({
            number: powerByDeposits,
            precision: 0,
            shouldFormatToEther: false,
          })}{" "}
          {t(localeKeys.power)}
        </div>
      </div>
    </ModalEnhanced>
  );
};

interface UndelegationProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/*Bond more or less deposits*/
const UndelegationModal = ({ isVisible, onClose, onConfirm, onCancel }: UndelegationProps) => {
  const { t } = useAppTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { stakingContract } = useWallet();
  const { unbondingDuration } = useStorage();
  const unbondingTime = secondsToHumanTime(unbondingDuration ?? 0);

  useEffect(() => {
    setLoading(false);
  }, [isVisible]);

  const onConfirmUndelegation = async () => {
    try {
      setLoading(true);
      const response = (await stakingContract?.chill()) as TransactionResponse;
      await response.wait(1);
      setLoading(false);
      onConfirm();
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setLoading(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      // console.log(e);
    }
  };

  //TODO the localeKeys.sureToUndelegate text needs to be changed since undelegation doesn't take 14 days
  return (
    <ModalEnhanced
      modalTitle={t(localeKeys.sureToUndelegate)}
      cancelText={t(localeKeys.cancel)}
      confirmText={t(localeKeys.undelegate)}
      onConfirm={onConfirmUndelegation}
      isLoading={isLoading}
      isCancellable={false}
      isVisible={isVisible}
      onClose={onClose}
      onCancel={onCancel}
      className={"!max-w-[400px]"}
    >
      <div className={"pb-[20px] divider border-b text-12"}>
        {t(localeKeys.undelegationConfirmInfo, { unbondingTime: `${unbondingTime.time} ${unbondingTime.unit}` })}
      </div>
    </ModalEnhanced>
  );
};
