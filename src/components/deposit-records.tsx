import Table, { ColumnType } from "./table";
import { formatBlanace, formatTime, getChainConfig } from "@/utils";
import Progress from "./progress";
import { Deposit, DepositRecordsDataSource } from "@/types";
import { useApp, useStaking } from "@/hooks";
import { useState } from "react";
import Tooltip from "./tooltip";
import WithdrawModal, { WithdrawType } from "./withdraw-modal";
import RecordsActionButton from "./records-action-button";

type DataSource = DepositRecordsDataSource;

export default function DepositRecords() {
  const [openWithdraw, setOpenWithdraw] = useState<{ type: WithdrawType; deposit: Deposit } | null>(null);
  const { deposits, isDepositsInitialized } = useStaking();
  const { activeChain } = useApp();

  const { nativeToken, ktonToken } = getChainConfig(activeChain);

  const columns: ColumnType<DataSource>[] = [
    {
      key: "id",
      dataIndex: "id",
      width: "12%",
      title: <span>No.</span>,
      render: (row) => <span className="truncate text-sm font-light text-primary">{`ID #${row.id}`}</span>,
    },
    {
      key: "duration",
      dataIndex: "startTime",
      width: "26%",
      title: <span>Duration</span>,
      render: (row) => (
        <div className="flex w-fit flex-col gap-small">
          <div className="flex items-center gap-small text-sm font-light text-white">
            <span>{formatTime(row.startTime)}</span>
            <span>-</span>
            <span>{formatTime(row.expiredTime)}</span>
          </div>
          <Progress start={row.startTime} end={row.expiredTime} />
        </div>
      ),
    },
    {
      key: "amount",
      dataIndex: "value",
      width: "20%",
      title: <span>Amount (RING)</span>,
      render: (row) => (
        <span className="truncate">{formatBlanace(row.value, nativeToken.decimals, { precision: 4 })}</span>
      ),
    },
    {
      key: "reward",
      dataIndex: "reward",
      title: <span>Reward (KTON)</span>,
      render: (row) => (
        <span className="truncate">{formatBlanace(row.reward, ktonToken?.decimals, { precision: 6 })}</span>
      ),
    },
    {
      key: "action",
      dataIndex: "accountId",
      width: "20%",
      title: <span>Action</span>,
      render: (row) => {
        if (row.canEarlyWithdraw) {
          if (row.inUse) {
            return (
              <Tooltip
                content={
                  <span className="text-xs font-light text-white">
                    This deposit is used in staking, you should unbond it first then release it to be able to withdraw
                    it.
                  </span>
                }
                className="w-fit"
                contentClassName="w-64"
              >
                <RecordsActionButton disabled>Withdraw Earlier</RecordsActionButton>
              </Tooltip>
            );
          }
          return (
            <RecordsActionButton onClick={() => setOpenWithdraw({ type: "early", deposit: row })}>
              Withdraw Earlier
            </RecordsActionButton>
          );
        } else if (row.inUse) {
          return (
            <Tooltip
              content={
                <span className="text-xs font-light text-white">
                  This deposit is used in staking, you should unbond it first then release it to be able to withdraw it.
                </span>
              }
              className="w-fit"
              contentClassName="w-64"
            >
              <RecordsActionButton disabled>Withdraw</RecordsActionButton>
            </Tooltip>
          );
        } else {
          return (
            <RecordsActionButton onClick={() => setOpenWithdraw({ type: "regular", deposit: row })}>
              Withdraw
            </RecordsActionButton>
          );
        }
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-large bg-component p-5">
        <h5 className="text-sm font-bold text-white">Active Deposit Records</h5>
        <Table
          columns={columns}
          dataSource={deposits.map((item) => ({ ...item, key: item.id }))}
          loading={!isDepositsInitialized}
        />
      </div>
      <WithdrawModal
        isOpen={!!openWithdraw}
        onClose={() => setOpenWithdraw(null)}
        type={openWithdraw?.type}
        deposit={openWithdraw?.deposit}
      />
    </>
  );
}
