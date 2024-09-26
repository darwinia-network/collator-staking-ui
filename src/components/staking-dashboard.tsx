"use client";

import { redirect } from "next/navigation";
import { useAccount } from "wagmi";
import LatestRewards from "./latest-rewards";
import ReservedInStaking from "./reserved-in-staking";
import StakingDepositTabs from "./staking-deposit-tabs";
import { Migration } from "./migration";

export default function StakingDashboard() {
  const { address } = useAccount();

  if (!address) {
    redirect("/");
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row">
        <LatestRewards />
        <ReservedInStaking />
      </div>

      <StakingDepositTabs />
      <Migration />
    </>
  );
}
