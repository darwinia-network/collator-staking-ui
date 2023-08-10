import { getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useAccount, useBalance } from "wagmi";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
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
  const { calcExtraPower } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { nativeToken, contract, explorer } = getChainConfig(activeChain);

  const handleBond = useCallback(async () => {
    if ((ringBalance?.value || 0n) < inputAmount) {
      notification.warn({ description: "Your balance is insufficient." });
    } else {
      setBusy(true);

      try {
        const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: contractAbi,
          functionName: "stake",
          args: [inputAmount, 0n, []],
        });
        const receipt = await waitForTransaction({ hash });

        if (receipt.status === "success") {
          setInputAmount(0n);
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
      }

      setBusy(false);
    }
  }, [contract.staking, explorer, inputAmount, ringBalance?.value, onClose]);

  return (
    <BondMoreTokenModal
      isOpen={isOpen}
      symbol={nativeToken.symbol}
      decimals={nativeToken.decimals}
      power={calcExtraPower(inputAmount, 0n)}
      balance={ringBalance?.value || 0n}
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
