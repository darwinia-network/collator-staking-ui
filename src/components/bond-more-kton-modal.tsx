import { getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useApp, useStaking } from "@/hooks";
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
  const { calcExtraPower } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { ktonToken, contract, explorer } = getChainConfig(activeChain);
  const { data: ktonBalance } = useBalance({ address, token: ktonToken?.address, watch: true });

  const handleBond = useCallback(async () => {
    if ((ktonBalance?.value || 0n) < inputAmount) {
      notification.warn({ description: "Your balance is insufficient." });
    } else {
      setBusy(true);

      try {
        const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: contractAbi,
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
  }, [contract.staking, explorer, inputAmount, ktonBalance?.value, onClose]);

  return (
    ktonToken && (
      <BondMoreTokenModal
        isOpen={isOpen}
        symbol={ktonToken.symbol}
        decimals={ktonToken.decimals}
        power={calcExtraPower(0n, inputAmount)}
        balance={ktonBalance?.value || 0n}
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
