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
      <p className="text-sm">
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
          "Unstake both your staking RING and Deposit",
          "Migrate all your Deposit",
          "Go to new staking DApp to create new stake",
        ].map((step, index) => (
          <div key={index} className="bg-white/20 px-5 py-2.5 text-sm font-light text-white">
            Step {index + 1}: Click &quot;{["Unstake", "Migrate", "Stake"][index]}&quot; button {step}
          </div>
        ))}
      </div>
    </Modal>
  );
}
