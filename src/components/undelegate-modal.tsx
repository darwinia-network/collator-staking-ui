import { formatDistanceStrict } from "date-fns";
import Modal from "./modal";
import { UNBONDING_DURATION } from "@/config";
import { useCallback, useState } from "react";
import { useApp } from "@/hooks";
import { getChainConfig, notifyTransaction } from "@/utils";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { notification } from "./notification";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export default function UndelegateModal({ isOpen, onClose = () => undefined }: Props) {
  const [busy, setBusy] = useState(false);
  const { activeChain } = useApp();

  const handleUndelegate = useCallback(async () => {
    const chainConfig = getChainConfig(activeChain);
    setBusy(true);

    try {
      const contractAbi = (await import(`@/config/abi/${chainConfig.contract.staking.abiFile}`)).default;

      const { hash } = await writeContract({
        address: chainConfig.contract.staking.address,
        abi: contractAbi,
        functionName: "chill",
        args: [],
      });
      const receipt = await waitForTransaction({ hash });

      if (receipt.status === "success") {
        onClose();
      }
      notifyTransaction(receipt, chainConfig.explorer);
    } catch (err) {
      console.error(err);
      notification.error({ description: (err as Error).message });
    }

    setBusy(false);
  }, [activeChain, onClose]);

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
