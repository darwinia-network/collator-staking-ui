import { useMemo } from "react";
import Table, { ColumnType } from "./table";
import { prettyNumber } from "@/utils";
import Jazzicon from "./jazzicon";
import Image from "next/image";
import { useStaking } from "@/hooks";
import { useAccount } from "wagmi";
import Tooltip from "./tooltip";
import { StakingRecordsDataSource } from "@/types";
import DisplayAccountName from "./display-account-name";
import StakingMoreAction from "./staking-more-action";
import RecordsSelectCollator from "./records-select-collator";
import RecordsBondedTokens from "./records-bonded-tokens";
import UnbondAllStaked from "./unbond-all-staked";

type DataSource = StakingRecordsDataSource;

export default function StakingRecords() {
  const {
    power,
    stakedRing,
    stakedKton,
    totalOfDepositsInStaking,
    unbondingRing,
    unbondingKton,
    unbondingDeposits,
    nominatorCollators,
    activeCollators,
    isNominatorCollatorsInitialized,
    isActiveCollatorsInitialized,
    isLedgersInitialized,
    isNominatorCollatorsLoading,
  } = useStaking();
  const { address } = useAccount();

  const columns: ColumnType<DataSource>[] = [
    {
      key: "collator",
      dataIndex: "collator",
      width: "24%",
      title: <span>Collator</span>,
      render: (row) => {
        if (row.collator) {
          return (
            <div className="flex items-center gap-small">
              <Jazzicon address={row.collator} size={24} className="hidden lg:flex" />
              <DisplayAccountName address={row.collator} />
              {!row.isActive && (
                <Tooltip
                  content={
                    <span className="text-xs font-light text-white">
                      This collator is currently in the waiting pool. The rewards will not be earned until the collator
                      joins the active pool.
                    </span>
                  }
                  className="w-fit shrink-0"
                  contentClassName="w-64"
                >
                  <Image
                    alt="Collator tooltip"
                    width={16}
                    height={16}
                    src="/images/warning.svg"
                    className="transition-transform hover:scale-105"
                  />
                </Tooltip>
              )}
            </div>
          );
        }

        return <RecordsSelectCollator text="Select a collator" />;
      },
    },
    {
      key: "stakedPower",
      dataIndex: "stakedPower",
      title: <span>Your staked (Power)</span>,
      render: (row) => {
        if (row.collator) {
          return <span className="truncate">{prettyNumber(row.stakedPower)}</span>;
        }

        return (
          <div className="flex items-center gap-middle">
            <span className="truncate text-white/50">{prettyNumber(row.stakedPower)}</span>
            <Tooltip
              content={
                <span className="text-xs font-light text-white">
                  The power is not working yet, You can delegate a collator to complete staking.
                </span>
              }
              className="w-fit"
              contentClassName="w-64"
            >
              <Image
                alt="Collator tooltip"
                width={16}
                height={16}
                src="/images/help.svg"
                className="transition-transform hover:scale-105"
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "bondedTokens",
      dataIndex: "bondedTokens",
      width: "30%",
      title: <span>Your bonded tokens</span>,
      render: (row) => <RecordsBondedTokens row={row} />,
    },
    {
      key: "action",
      dataIndex: "action",
      width: "26%",
      title: <span>Action</span>,
      render: (row) => {
        if (row.collator) {
          return (
            <div className="flex items-center gap-middle">
              <RecordsSelectCollator text="Change collator" />
              <StakingMoreAction />
            </div>
          );
        }

        return <UnbondAllStaked />;
      },
    },
  ];

  const dataSource: DataSource[] = useMemo(() => {
    const hasStaking =
      stakedRing > 0 ||
      stakedKton > 0 ||
      totalOfDepositsInStaking > 0 ||
      unbondingRing.length > 0 ||
      unbondingKton.length > 0 ||
      unbondingDeposits.length > 0;

    if (address && hasStaking) {
      const collator = nominatorCollators[address]?.at(0);

      return [
        {
          key: collator || "0",
          collator: collator || "",
          stakedPower: power,
          bondedTokens: {
            stakedRing,
            stakedKton,
            totalOfDepositsInStaking,
            unbondingRing,
            unbondingKton,
            unbondingDeposits,
          },
          isActive: activeCollators.some((item) => item.toLowerCase() === (collator || "").toLowerCase()),
          action: true,
        },
      ];
    }

    return [];
  }, [
    address,
    power,
    stakedRing,
    stakedKton,
    totalOfDepositsInStaking,
    unbondingRing,
    unbondingKton,
    unbondingDeposits,
    nominatorCollators,
    activeCollators,
  ]);

  return (
    <div className="flex flex-col gap-large bg-component p-5">
      <h5 className="text-sm font-bold text-white">Staking Delegations</h5>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={
          !isActiveCollatorsInitialized ||
          !isNominatorCollatorsInitialized ||
          !isLedgersInitialized ||
          isNominatorCollatorsLoading
        }
      />
    </div>
  );
}
