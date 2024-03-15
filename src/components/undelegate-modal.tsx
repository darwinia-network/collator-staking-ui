import { formatDistanceStrict } from "date-fns";
import Modal from "./modal";
import { UNBONDING_DURATION } from "@/config";
import { useCallback, useState } from "react";
import { useApp } from "@/hooks";
import { getChainConfig, notifyTransaction } from "@/utils";
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export default function UndelegateModal({ isOpen, onClose = () => undefined }: Props) {
  const [busy, setBusy] = useState(false);
  const { activeChain } = useApp();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleUndelegate = useCallback(async () => {
    const chainConfig = getChainConfig(activeChain);
    setBusy(true);

    if (walletClient && publicClient) {
      try {
        const hash = await walletClient.writeContract({
          address: chainConfig.contract.staking.address,
          abi: (await import(`@/config/abi/${chainConfig.contract.staking.abiFile}`)).default,
          functionName: "chill",
          args: [],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          onClose();
        }
        notifyTransaction(receipt, chainConfig.explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }
    }

    setBusy(false);
  }, [activeChain, walletClient, publicClient, onClose]);

  return (
    <Modal
      title="Sure to undelegate now?"
      isOpen={isOpen}
      onCancel={onClose}
      onClose={onClose}
      onOk={handleUndelegate}
      maskClosable={false}
      okText="Undelegate"
      className="lg:w-[25rem]"
      busy={busy}
    >
      <p className="text-sm font-light text-white">{`After undelegation, if there are some bonded token, you'll have to manually unbond them. After unbonding, they'll go through the ${formatTime(
        UNBONDING_DURATION
      )} unbonding period. When the unbonding period is over, you'll have to manually release them before they become transferable.`}</p>
    </Modal>
  );
}

function formatTime(seconds: number) {
  const now = Date.now();
  return formatDistanceStrict(now + seconds * 1000, now);
}
