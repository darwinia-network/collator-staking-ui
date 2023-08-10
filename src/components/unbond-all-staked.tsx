import { useApp, useStaking } from "@/hooks";
import RecordsActionButton from "./records-action-button";
import { useCallback, useState } from "react";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { notification } from "./notification";
import { getChainConfig, notifyTransaction } from "@/utils";

export default function UnbondAllStaked() {
  const { stakedRing, stakedKton, stakedDeposits } = useStaking();
  const { activeChain } = useApp();
  const [busy, setBusy] = useState(false);

  const handleUnbond = useCallback(async () => {
    const { contract, explorer } = getChainConfig(activeChain);
    setBusy(true);

    try {
      const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

      const { hash } = await writeContract({
        address: contract.staking.address,
        abi: contractAbi,
        functionName: "unstake",
        args: [stakedRing, stakedKton, stakedDeposits],
      });
      const receipt = await waitForTransaction({ hash });

      notifyTransaction(receipt, explorer);
    } catch (err) {
      console.error(err);
      notification.error({ description: (err as Error).message });
    }

    setBusy(false);
  }, [activeChain, stakedRing, stakedKton, stakedDeposits]);

  return (
    <RecordsActionButton busy={busy} onClick={handleUnbond}>
      Unbond all
    </RecordsActionButton>
  );
}
