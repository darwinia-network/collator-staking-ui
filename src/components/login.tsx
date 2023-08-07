"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { redirect } from "next/navigation";
import { useAccount } from "wagmi";

export default function Login() {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  if (address) {
    redirect("/staking");
  }

  return (
    <>
      <button
        onClick={() => openConnectModal && openConnectModal()}
        className="bg-primary px-large py-middle text-sm font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
      >
        Connect Wallet
      </button>
      <p className="text-center text-xs font-light text-[#FFFDFD]">
        Connect wallet to participate in staking and deposit in Darwinia.
      </p>
    </>
  );
}
