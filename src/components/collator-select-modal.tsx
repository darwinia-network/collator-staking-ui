import { Key, useDeferredValue, useEffect, useMemo, useState } from "react";
import Modal from "./modal";
import Tabs, { TabsProps } from "./tabs";
import Image from "next/image";
import { useAccount } from "wagmi";
import Table, { ColumnType } from "./table";
import Jazzicon from "./jazzicon";
import { formatBlanace, prettyNumber } from "@/utils";
import { notification } from "./notification";
import DisplayAccountName from "./display-account-name";
import { useDip6, useStaking } from "@/hooks";
import Tooltip from "./tooltip";

type TabKey = "active" | "waiting";

interface DataSource {
  key: Key;
  collator: string;
  power: bigint;
  commission: string;
  blocks: number;
  sessionKey: string | undefined;
}

function getColumns(activeTab: TabKey, isDip6Implemented: boolean) {
  const columns: ColumnType<DataSource>[] = [
    {
      key: "collator",
      dataIndex: "collator",
      width: "32%",
      title: <span className="text-xs font-bold text-white">Collator</span>,
      render: (row) => (
        <div className="flex items-center gap-small">
          <Jazzicon size={20} address={row.collator} className="hidden lg:flex" />
          <DisplayAccountName address={row.collator} />
          <Image
            alt="Copy collator"
            width={16}
            height={16}
            src="/images/copy.svg"
            className="transition-transform hover:scale-105 hover:cursor-pointer active:scale-95"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(row.collator);
                notification.success({
                  title: "Copy address successfully",
                  disabledCloseBtn: true,
                  duration: 3000,
                });
              } catch (err) {
                console.error(err);
              }
            }}
          />
          {row.sessionKey ? null : (
            <Tooltip
              contentClassName="text-xs font-light text-white w-80"
              content="This collator is not ready yet because the session key has not been set"
            >
              <Image width={15} height={15} alt="Warning" src="/images/extra-warning.svg" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: "power",
      dataIndex: "power",
      title: (
        <div className="inline-flex items-center gap-small">
          <span className="text-xs font-bold text-white">{activeTab === "active" ? "Vote" : "Total-staked"}</span>
          {activeTab === "active" && (
            <Tooltip
              content={<span className="text-xs font-light text-white">Vote = Total-staked * (1 - Commission)</span>}
              enabledSafePolygon
              contentClassName="w-80"
            >
              <Image
                width={15}
                height={14}
                alt="Info"
                src="/images/help.svg"
                className="opacity-60 transition-opacity hover:opacity-100"
              />
            </Tooltip>
          )}
        </div>
      ),
      render: (row) => {
        if (activeTab === "active" && !isDip6Implemented) {
          return <span>{prettyNumber(row.power)}</span>;
        }
        return <span>{formatBlanace(row.power, 18, { keepZero: false, precision: 0 })}</span>;
      },
    },
    {
      key: "commission",
      dataIndex: "commission",
      width: "20%",
      title: <span className="text-xs font-bold text-white">Commission</span>,
      render: (row) => <span>{row.commission}</span>,
    },
    {
      key: "blocks",
      dataIndex: "blocks",
      width: "20%",
      title: (
        <div className="inline-flex flex-col text-xs font-bold text-white">
          <span>Blocks</span>
          <span>Last session</span>
        </div>
      ),
      render: (row) => <span>{row.blocks >= 0 ? row.blocks : "-"}</span>,
    },
  ];

  return columns;
}

export default function CollatorSelectModal({
  isOpen,
  onClose = () => undefined,
  onConfirm = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: (collator: string) => void;
}) {
  const {
    nominatorCollators,
    collatorSessionKey,
    collatorCommission,
    collatorLastSessionBlocks,
    collatorPower,
    activeCollators,
    isCollatorPowerInitialized,
    isCollatorLastSessionBlocksInitialized,
    isCollatorSessionKeyInitialized,
    isCollatorCommissionInitialized,
    isNominatorCollatorsInitialized,
    isActiveCollatorsInitialized,
  } = useStaking();
  const { address } = useAccount();

  const [selectedCollator, setSelectedCollator] = useState<Key | undefined>(undefined);
  const [activeKey, setActiveKey] = useState<TabsProps<TabKey>["activeKey"]>("active");
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);

  const dataSource = useMemo<DataSource[]>(() => {
    return Object.keys(collatorCommission)
      .filter((collator) =>
        activeKey === "active" ? activeCollators.includes(collator) : !activeCollators.includes(collator)
      )
      .filter((collator) => collator.toLowerCase().includes(deferredKeyword.toLowerCase()))
      .map((collator) => ({
        key: collator,
        collator,
        power: collatorPower[collator] || 0n,
        commission: collatorCommission[collator] || "-",
        blocks: collatorLastSessionBlocks[collator] || -1,
        sessionKey: collatorSessionKey[collator],
      }));
  }, [
    activeCollators,
    activeKey,
    collatorSessionKey,
    collatorCommission,
    collatorLastSessionBlocks,
    collatorPower,
    deferredKeyword,
  ]);

  const loading =
    !isCollatorPowerInitialized ||
    !isCollatorLastSessionBlocksInitialized ||
    !isCollatorSessionKeyInitialized ||
    !isCollatorCommissionInitialized ||
    !isNominatorCollatorsInitialized ||
    !isActiveCollatorsInitialized;

  useEffect(() => {
    if (address && nominatorCollators[address]?.length && isOpen) {
      setSelectedCollator((prev) => prev ?? nominatorCollators[address]?.at(0));
    } else if (!isOpen) {
      setSelectedCollator(undefined);
    }
  }, [address, nominatorCollators, isOpen]);

  const { isDip6Implemented } = useDip6();

  return (
    <Modal
      title="Select A Collator"
      isOpen={isOpen}
      okText="Confirm"
      onClose={onClose}
      onCancel={onClose}
      onOk={() => selectedCollator && onConfirm(selectedCollator as string)}
      maskClosable={false}
      className="lg:w-[48rem]"
      btnWrapClassName="lg:flex-row"
      btnClassName="lg:w-[9.375rem]"
      disabled={!address || !selectedCollator || selectedCollator === nominatorCollators[address]?.at(0)}
    >
      <Tabs
        items={[
          {
            key: "active",
            label: <span>Active Pool</span>,
            children: (
              <div className="flex flex-col gap-middle">
                <div className="flex flex-col items-center gap-middle lg:flex-row lg:justify-between lg:gap-small">
                  <span className="text-xs font-light text-white/50">
                    These candidates are in the active collator pool of the current Session.
                  </span>
                  <SearchInput onChange={setKeyword} />
                </div>
                <Table
                  dataSource={dataSource}
                  columns={getColumns(activeKey, isDip6Implemented)}
                  styles={{ minWidth: 560 }}
                  contentClassName="h-[22vh] lg:h-[28vh]"
                  selectedItem={selectedCollator}
                  onRowSelect={setSelectedCollator}
                  loading={loading}
                />
              </div>
            ),
          },
          {
            key: "waiting",
            label: <span>Waiting Pool</span>,
            children: (
              <div className="flex flex-col gap-middle">
                <SearchInput onChange={setKeyword} />
                <Table
                  dataSource={dataSource}
                  columns={getColumns(activeKey, isDip6Implemented)}
                  styles={{ minWidth: 560 }}
                  contentClassName="h-[28vh]"
                  selectedItem={selectedCollator}
                  onRowSelect={setSelectedCollator}
                  loading={loading}
                />
              </div>
            ),
          },
        ]}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
    </Modal>
  );
}

function SearchInput({ onChange = () => undefined }: { onChange?: (value: string) => void }) {
  return (
    <div className="flex h-8 w-full items-center gap-middle border border-white/50 px-middle transition-colors focus-within:border-white hover:border-white lg:w-52 lg:self-end">
      <Image alt="Search" width={20} height={20} src="/images/search.svg" />
      <input
        className="h-full w-full bg-transparent text-xs font-light focus-visible:outline-none"
        placeholder="Search for a collator"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
