import { commissionWeightedPower, getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
import { notification } from "./notification";

export default function BondMoreRingModal({
  commission,
  isOpen,
  onClose = () => undefined,
}: {
  commission: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { address } = useAccount();
  const { data: ringBalance } = useBalance({ address, query: { refetchInterval: 3000 } });
  const { isStakingV2, calcExtraPower } = useStaking();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { nativeToken } = getChainConfig(activeChain);

  const handleBond = useCallback(async () => {
    if ((ringBalance?.value || 0n) < inputAmount) {
      notification.warn({ description: "Your balance is insufficient." });
    } else if (walletClient && publicClient) {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const abi = isStakingV2
          ? (await import("@/config/abi/staking-v2.json")).default
          : (await import("@/config/abi/staking.json")).default;

        const hash = await walletClient.writeContract({
          address: contract.staking.address,
          abi,
          functionName: "stake",
          args: [inputAmount, 0n, []],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

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
  }, [activeChain, inputAmount, ringBalance?.value, isStakingV2, walletClient, publicClient, onClose]);

  return (
    <BondMoreTokenModal
      isOpen={isOpen}
      symbol={nativeToken.symbol}
      decimals={nativeToken.decimals}
      power={commissionWeightedPower(calcExtraPower(inputAmount, 0n), commission)}
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
