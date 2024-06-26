import { formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import UnbondTokenModal from "./unbond-token-modal";
import { useApp, useDip6, useRateLimit, useStaking } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";

export default function UnbondRingModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { stakedRing } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { nativeToken } = getChainConfig(activeChain);

  const { isDip6Implemented } = useDip6();
  const { availableWithdraw, updateRateLimit } = useRateLimit();
  useEffect(() => {
    if (isOpen) {
      updateRateLimit();
    }
  }, [isOpen, updateRateLimit]);

  const handleUnbond = useCallback(async () => {
    if (stakedRing < inputAmount) {
      notification.warn({
        description: `You can't unbond more than ${formatBlanace(stakedRing, nativeToken.decimals, {
          precision: 4,
          keepZero: false,
        })} ${nativeToken.symbol}`,
      });
    } else {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
          functionName: "unstake",
          args: [inputAmount, []],
        });
        const receipt = await waitForTransaction({ hash });

        if (receipt.status === "success") {
          setInputAmount(0n);
          updateRateLimit();
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [activeChain, stakedRing, inputAmount, nativeToken, onClose, updateRateLimit]);

  return (
    <UnbondTokenModal
      isOpen={isOpen}
      symbol={nativeToken.symbol}
      decimals={nativeToken.decimals}
      balance={stakedRing}
      max={isDip6Implemented ? availableWithdraw : undefined}
      busy={busy}
      disabled={inputAmount <= 0n}
      isReset={inputAmount <= 0}
      onClose={onClose}
      onUnbond={handleUnbond}
      onCancel={onClose}
      onChange={setInputAmount}
    />
  );
}
