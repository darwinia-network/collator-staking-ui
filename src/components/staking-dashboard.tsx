"use client";

import { redirect } from "next/navigation";
import { useAccount } from "wagmi";
import Power from "./power";
import ReservedInStaking from "./reserved-in-staking";
import StakingDepositTabs from "./staking-deposit-tabs";

export default function StakingDashboard() {
  const { address } = useAccount();

  if (!address) {
    redirect("/");
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row">
        <Power />
        <ReservedInStaking />
      </div>

      <StakingDepositTabs />
    </>
  );
}
