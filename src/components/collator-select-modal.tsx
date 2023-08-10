import { Key, useDeferredValue, useEffect, useMemo, useState } from "react";
import Modal from "./modal";
import Tabs, { TabsProps } from "./tabs";
import Image from "next/image";
import { useAccount } from "wagmi";
import Table, { ColumnType } from "./table";
import Jazzicon from "./jazzicon";
import { prettyNumber } from "@/utils";
import { notification } from "./notification";
import DisplayAccountName from "./display-account-name";
import { useStaking } from "@/hooks";

type TabKey = "active" | "waiting";

interface DataSource {
  key: Key;
  collator: string;
  power: bigint;
  commission: string;
  blocks: number;
}

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
          onClick={(e) => {
            e.stopPropagation();
            notification.success({
              title: "Copy address successfully",
              disabledCloseBtn: true,
              duration: 3000,
            });
          }}
        />
      </div>
    ),
  },
  {
    key: "power",
    dataIndex: "power",
    title: (
      <div className="inline-flex flex-col text-xs font-bold text-white">
        <span>Total-staked</span>
        <span>(Power)</span>
      </div>
    ),
    render: (row) => <span>{prettyNumber(row.power)}</span>,
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
    collatorCommission,
    collatorLastSessionBlocks,
    collatorNominators,
    activeCollators,
    isCollatorNominatorsInitialized,
    isCollatorLastSessionBlocksInitialized,
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
        power: collatorNominators[collator]?.totalStakedPower || 0n,
        commission: collatorCommission[collator] || "-",
        blocks: collatorLastSessionBlocks[collator] || -1,
      }));
  }, [activeCollators, activeKey, collatorCommission, collatorLastSessionBlocks, collatorNominators, deferredKeyword]);

  const loading =
    !isCollatorNominatorsInitialized ||
    !isCollatorLastSessionBlocksInitialized ||
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
              <div className="flex h-[40vh] flex-col gap-middle overflow-y-hidden">
                <div className="flex flex-col items-center gap-middle lg:flex-row lg:justify-between lg:gap-small">
                  <span className="text-xs font-light text-white/50">
                    These candidates are in the active collator pool of the current Session.
                  </span>
                  <SearchInput onChange={setKeyword} />
                </div>
                <Table
                  dataSource={dataSource}
                  columns={columns}
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
              <div className="flex h-[40vh] flex-col gap-middle overflow-y-hidden">
                <SearchInput onChange={setKeyword} />
                <Table
                  dataSource={dataSource}
                  columns={columns}
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
        placeholder="search for a collator"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
