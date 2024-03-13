import { useApp, useStaking } from "@/hooks";
import { getChainConfig, notifyTransaction } from "@/utils";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import RecordsActionButton from "./records-action-button";
import CollatorSelectModal from "./collator-select-modal";
import { usePublicClient, useWalletClient } from "wagmi";

export default function RecordsSelectCollator({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { activeChain } = useApp();
  const { updateNominatorCollators } = useStaking();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleConfirm = useCallback(
    async (collator: string) => {
      setBusy(true);
      setIsOpen(false);
      const chainConfig = getChainConfig(activeChain);

      if (walletClient && publicClient) {
        try {
          const hash = await walletClient.writeContract({
            address: chainConfig.contract.staking.address,
            abi: (await import(`@/config/abi/${chainConfig.contract.staking.abiFile}`)).default,
            functionName: "nominate",
            args: [collator],
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          if (receipt.status === "success") {
            updateNominatorCollators();
          }
          notifyTransaction(receipt, chainConfig.explorer);
        } catch (err) {
          console.error(err);
          notification.error({ description: (err as Error).message });
        }
      }

      setBusy(false);
    },
    [activeChain, walletClient, publicClient, updateNominatorCollators]
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
