"use client";
import Link from "next/link";
import Modal from "../modal";

export function MigrationStartModal({
  isOpen,
  onClose,
  onOk,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}) {
  return (
    <Modal
      title="We are migrating"
      isOpen={isOpen}
      okText="Start Migration"
      onOk={onOk}
      onClose={onClose}
      className="md:w-[450px]"
      busy={false}
    >
      <p className="text-sm leading-[22px]">
        Please migrate to the new RING Pool to receive your rewards and participate in RingDAO governance. For more
        information, please check{" "}
        <Link
          href="https://github.com/darwinia-network/DIPs/blob/main/DIPs/dip-7.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF0083]"
        >
          DIP-7
        </Link>
        . To migrate, please follow the steps below:
      </p>
      <div className="flex flex-col gap-2.5">
        {[
          "to unstake your staked RING and Deposit.",
          "to migrate your Deposit.",
          "to go to the new staking DApp and create a new stake.",
        ].map((step, index) => (
          <div key={index} className="bg-white/20 px-5 py-2.5 text-sm font-light leading-[22px] text-white">
            Step {index + 1}: Click &quot;{["Unstake", "Migrate", "Stake in new pool"][index]}&quot; button {step}
          </div>
        ))}
      </div>
    </Modal>
  );
}
