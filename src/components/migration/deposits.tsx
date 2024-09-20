"use client";
import Modal from "../modal";
import EnsureMatchNetworkButton from "../ensure-match-network-button";
import { Deposit } from "@/types";
import { formatBlanace } from "@/utils";

export function DepositsModal({
  isOpen,
  busy,
  onClose,
  deposits = [],
  onConfirm,
}: {
  isOpen: boolean;
  deposits?: Deposit[];
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const totalDeposits = deposits.length;
  const maxMigratePerBatch = 50;
  const batchesRequired = Math.ceil(totalDeposits / maxMigratePerBatch);
  const currentBatchSize = Math.min(totalDeposits, maxMigratePerBatch);

  return (
    <Modal
      title="Migrate deposits"
      isOpen={isOpen}
      okText="Start Migration"
      onClose={onClose}
      className="lg:w-[450px]"
      busy={busy}
    >
      <div className="max-h-1/2 flex w-full flex-col gap-5 overflow-y-auto pb-5">
        {deposits.length ? (
          deposits.map(({ id, value }) => (
            <div className="flex justify-between" key={id}>
              <span className="text-sm font-light text-white">Token ID [{id}]</span>
              <span className="text-sm font-light text-white">{formatBlanace(value)} RING</span>
            </div>
          ))
        ) : (
          <div className="text-sm font-light text-white">No deposits found</div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-px bg-white/20" />
        <div className="text-xs font-light text-white">Total: {totalDeposits} items</div>
        <EnsureMatchNetworkButton
          className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
          onClick={onConfirm}
          disabled={totalDeposits === 0}
          busy={busy}
        >
          Migrate({currentBatchSize})
        </EnsureMatchNetworkButton>
        <p className="m-0 text-xs font-light text-white">
          You can migrate up to 50 deposit items at a time. To migrate all deposit items, please complete this process{" "}
          <span className="text-[#FF0083]">{batchesRequired}</span> time(s).
        </p>
      </div>
    </Modal>
  );
}
