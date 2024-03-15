import { useApp, useStaking } from "@/hooks";
import RecordsActionButton from "./records-action-button";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import { getChainConfig, notifyTransaction } from "@/utils";
import { usePublicClient, useWalletClient } from "wagmi";

export default function UnbondAllStaked() {
  const { stakedRing, stakedKton, stakedDeposits, isStakingV2 } = useStaking();
  const { activeChain } = useApp();
  const [busy, setBusy] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleUnbond = useCallback(async () => {
    const { contract, explorer } = getChainConfig(activeChain);
    setBusy(true);

    if (walletClient && publicClient) {
      try {
        const abi = isStakingV2
          ? (await import("@/config/abi/staking-v2.json")).default
          : (await import("@/config/abi/staking.json")).default;

        const hash = await walletClient.writeContract({
          address: contract.staking.address,
          abi,
          functionName: "unstake",
          args: [stakedRing, stakedKton, stakedDeposits],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }
    }

    setBusy(false);
  }, [activeChain, stakedRing, stakedKton, stakedDeposits, isStakingV2, walletClient, publicClient]);

  return (
    <RecordsActionButton busy={busy} onClick={handleUnbond}>
      Unbond all
    </RecordsActionButton>
  );
}
