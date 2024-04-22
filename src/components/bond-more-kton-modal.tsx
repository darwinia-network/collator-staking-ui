import { getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useApp } from "@/hooks";
import { useAccount, useBalance } from "wagmi";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";

export default function BondMoreKtonModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { address } = useAccount();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { ktonToken } = getChainConfig(activeChain);
  const { data: ktonBalance } = useBalance({ address, token: ktonToken?.address, watch: true });

  const handleBond = useCallback(async () => {
    if ((ktonBalance?.value || 0n) < inputAmount) {
      notification.warn({ description: "Your balance is insufficient." });
    } else {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
          functionName: "stake",
          args: [0n, inputAmount, []],
        });
        const receipt = await waitForTransaction({ hash });

        if (receipt.status === "success") {
          setInputAmount(0n);
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [activeChain, inputAmount, ktonBalance?.value, onClose]);

  return (
    ktonToken && (
      <BondMoreTokenModal
        isOpen={isOpen}
        symbol={ktonToken.symbol}
        decimals={ktonToken.decimals}
        balance={ktonBalance?.value || 0n}
        max={0n}
        busy={busy}
        disabled={inputAmount <= 0n}
        isReset={inputAmount <= 0}
        onClose={onClose}
        onBond={handleBond}
        onCancel={onClose}
        onChange={setInputAmount}
      />
    )
  );
}
