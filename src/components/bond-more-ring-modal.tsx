import { getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useAccount, useBalance } from "wagmi";
import { useApp, useDip6, useRateLimit } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";

export default function BondMoreRingModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { address } = useAccount();
  const { data: ringBalance } = useBalance({ address, watch: true });

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { nativeToken } = getChainConfig(activeChain);

  const { isDip6Implemented } = useDip6();
  const { availableDeposit, updateRateLimit } = useRateLimit();
  useEffect(() => {
    if (isOpen) {
      updateRateLimit();
    }
  }, [isOpen, updateRateLimit]);

  const handleBond = useCallback(async () => {
    if ((ringBalance?.value || 0n) < inputAmount) {
      notification.warn({ description: "Your balance is insufficient." });
    } else {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
          functionName: "stake",
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
      }

      setBusy(false);
    }
  }, [activeChain, inputAmount, ringBalance?.value, onClose, updateRateLimit]);

  return (
    <BondMoreTokenModal
      isOpen={isOpen}
      symbol={nativeToken.symbol}
      decimals={nativeToken.decimals}
      balance={ringBalance?.value || 0n}
      max={isDip6Implemented ? availableDeposit : undefined}
      busy={busy}
      disabled={inputAmount <= 0n}
      isReset={inputAmount <= 0}
      onClose={onClose}
      onBond={handleBond}
      onCancel={onClose}
      onChange={setInputAmount}
    />
  );
}
