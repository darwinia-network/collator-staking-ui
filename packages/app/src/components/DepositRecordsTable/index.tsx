import { Button, Column, Table, Tooltip, ModalEnhanced, notification } from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { useStorage, useWallet } from "@darwinia/app-providers";
import helpIcon from "../../assets/images/help.svg";
import { useEffect, useRef, useState } from "react";
import { Deposit } from "@darwinia/app-types";
import { formatDate, prettifyNumber } from "@darwinia/app-utils";
import BigNumber from "bignumber.js";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { TransactionResponse } from "@ethersproject/providers";

const DepositRecordsTable = () => {
  const { t } = useAppTranslation();
  const { selectedNetwork } = useWallet();
  /*All deposits list are available in the ledger, so listening to isLoadingLedger will
   * allow adding the loading listener */
  const { deposits, isLoadingLedger } = useStorage();
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const depositToWithdraw = useRef<Deposit | null>(null);
  const withdrawType = useRef<WithdrawModalType>("early");
  const precision = 3;
  const rewardPrecision = 9;

  const onCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
  };

  const onShowWithdrawModal = (deposit: Deposit, type: WithdrawModalType) => {
    depositToWithdraw.current = deposit;
    withdrawType.current = type;
    setShowWithdrawModal(true);
  };

  const onConfirmWithdraw = () => {
    setShowWithdrawModal(false);
  };

  const dataSource: Deposit[] = deposits ?? [];

  const columns: Column<Deposit>[] = [
    {
      id: "1",
      title: <div>{t(localeKeys.serialNumber)}</div>,
      key: "id",
      render: (row) => {
        return <div className={"text-primary"}>ID# {row.id}</div>;
      },
      width: "150px",
    },
    {
      id: "2",
      title: <div>{t(localeKeys.duration)}</div>,
      key: "expiredTime",
      width: "350px",
      render: (row) => {
        const startDate = formatDate(row.startTime);
        const endDate = formatDate(row.expiredTime);
        const totalTimeRange = row.expiredTime - row.startTime;
        const timeRangeSoFar = new Date().getTime() - row.startTime;
        const percentage = (timeRangeSoFar / totalTimeRange) * 100;

        return (
          <div className={"flex flex-col gap-[3px]"}>
            <div>
              {startDate} - {endDate}
            </div>
            <div className={"bg-[rgba(255,0,31,0.3)] w-full h-[4px] rounded-[2px] relative"}>
              <div
                style={{ width: `${percentage}%` }}
                className={"absolute rounded-[2px] left-0 top-0 h-full bg-primary"}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "3",
      title: <div>{t(localeKeys.amount)}</div>,
      key: "value",
      render: (row) => {
        return (
          <div>
            {prettifyNumber({
              number: row.value,
              precision,
            })}{" "}
            {selectedNetwork?.ring.symbol.toUpperCase()}
          </div>
        );
      },
    },
    {
      id: "4",
      title: <div>{t(localeKeys.reward)}</div>,
      key: "value",
      render: (row) => {
        return (
          <div>
            {prettifyNumber({
              number: row.reward,
              precision: rewardPrecision,
            })}{" "}
            {selectedNetwork?.kton.symbol.toUpperCase()}
          </div>
        );
      },
    },
    {
      id: "5",
      title: <div>{t(localeKeys.actions)}</div>,
      key: "value",
      width: "240px",
      render: (row) => {
        let actionButton: JSX.Element;
        if (row.canEarlyWithdraw) {
          // these can all be withdrawn early
          if (row.inUse) {
            actionButton = (
              <>
                <Tooltip message={<div>{t(localeKeys.depositInUseUnstakeFirst)}</div>}>
                  <Button disabled={true} btnType={"secondary"} className={"!h-[30px]"}>
                    {t(localeKeys.withdrawEarlier)}
                  </Button>
                </Tooltip>
              </>
            );
          } else {
            actionButton = (
              <>
                <Button
                  onClick={() => {
                    onShowWithdrawModal(row, "early");
                  }}
                  btnType={"secondary"}
                  className={"!h-[30px]"}
                >
                  {t(localeKeys.withdrawEarlier)}
                </Button>
              </>
            );
          }
        } else {
          if (row.inUse) {
            actionButton = (
              <>
                <Tooltip message={<div>{t(localeKeys.depositInUseUnstakeFirst)}</div>}>
                  <Button disabled={true} btnType={"secondary"} className={"!h-[30px]"}>
                    {t(localeKeys.withdrawEarlier)}
                  </Button>
                </Tooltip>
              </>
            );
          } else {
            actionButton = (
              <>
                <Button
                  onClick={() => {
                    onShowWithdrawModal(row, "regular");
                  }}
                  btnType={"secondary"}
                  className={"!h-[30px]"}
                >
                  {t(localeKeys.withdraw)}
                </Button>
              </>
            );
          }
        }
        return <div className={"flex items-center gap-[10px]"}>{actionButton}</div>;
      },
    },
  ];

  return (
    <div className={"flex flex-col"}>
      <div className={"flex flex-col mt-[20px]"}>
        <Table
          isLoading={isLoadingLedger}
          headerSlot={<div className={"text-14-bold pb-[10px]"}>{t(localeKeys.activeDepositRecords)}</div>}
          noDataText={t(localeKeys.noDepositRecords)}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
      <WithdrawModal
        onCancel={onCloseWithdrawModal}
        onConfirm={onConfirmWithdraw}
        isVisible={showWithdrawModal}
        onClose={onCloseWithdrawModal}
        deposit={depositToWithdraw.current}
        type={withdrawType.current}
      />
    </div>
  );
};

export default DepositRecordsTable;

type WithdrawModalType = "early" | "regular";

interface WithdrawProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  deposit: Deposit | null;
  type: WithdrawModalType;
}

const WithdrawModal = ({ isVisible, onClose, onConfirm, onCancel, deposit, type }: WithdrawProps) => {
  const { t } = useAppTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { selectedNetwork, depositContract } = useWallet();

  /*You'll be charged a penalty of 3 times the rewarded Kton if you want to
   * withdraw before the expiredTime */
  const penaltyAmount = deposit?.reward.times(3) ?? BigNumber(0);
  const btnText: string =
    type === "early"
      ? `${t(localeKeys.payAmount, {
          amount: `${prettifyNumber({
            number: penaltyAmount,
            precision: 9,
          })} ${selectedNetwork?.kton.symbol.toUpperCase()}`,
        })}`
      : `${t(localeKeys.withdraw)}`;

  useEffect(() => {
    setLoading(false);
  }, [isVisible]);

  const regularWithdraw = async () => {
    try {
      setLoading(true);
      const response = (await depositContract?.claim()) as TransactionResponse;
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
      console.log(e);
    }
  };

  const withdrawEarly = async () => {
    try {
      setLoading(true);
      const response = (await depositContract?.claim_with_penalty(
        EthersBigNumber.from(deposit?.id)
      )) as TransactionResponse;
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
      console.log(e);
    }
  };

  const onConfirmWithdraw = async () => {
    if (type === "early") {
      withdrawEarly();
    } else {
      regularWithdraw();
    }
  };

  const onCloseModal = () => {
    onClose();
  };

  const modalText =
    type === "early"
      ? `${t(localeKeys.earlyWithdrawInfo, {
          ktonSymbol: selectedNetwork?.kton.symbol.toUpperCase(),
          ringSymbol: selectedNetwork?.ring.symbol.toUpperCase(),
        })}`
      : `${t(localeKeys.withdrawInfo)}`;

  return (
    <ModalEnhanced
      modalTitle={t(localeKeys.sureToWithdraw)}
      cancelText={t(localeKeys.cancel)}
      confirmText={btnText}
      onConfirm={onConfirmWithdraw}
      isVisible={isVisible}
      onClose={onCloseModal}
      onCancel={onCancel}
      className={"!max-w-[400px]"}
      isLoading={isLoading}
    >
      <div className={"pb-[20px] divider border-b text-12"}>{modalText}</div>
    </ModalEnhanced>
  );
};
