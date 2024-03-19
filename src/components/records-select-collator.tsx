import { useApp, useStaking } from "@/hooks";
import { getChainConfig, notifyTransaction } from "@/utils";
import { useCallback, useState } from "react";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { notification } from "./notification";
import RecordsActionButton from "./records-action-button";
import CollatorSelectModal from "./collator-select-modal";

export default function RecordsSelectCollator({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { activeChain } = useApp();
  const { updateNominatorCollators } = useStaking();

  const handleConfirm = useCallback(
    async (collator: string) => {
      setBusy(true);
      setIsOpen(false);
      const chainConfig = getChainConfig(activeChain);

      try {
        const contractAbi = (await import(`@/config/abi/${chainConfig.contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: chainConfig.contract.staking.address,
          abi: contractAbi,
          functionName: "nominate",
          args: [collator],
        });
        const receipt = await waitForTransaction({ hash });

        if (receipt.status === "success") {
          updateNominatorCollators();
        }
        notifyTransaction(receipt, chainConfig.explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    },
    [activeChain, updateNominatorCollators]
  );

  return (
    <>
      <RecordsActionButton busy={busy} onClick={() => setIsOpen(true)}>
        {text}
      </RecordsActionButton>
      <CollatorSelectModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} />
    </>
  );
}
