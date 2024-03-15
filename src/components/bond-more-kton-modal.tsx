import { commissionWeightedPower, getChainConfig, notifyTransaction } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useApp, useStaking } from "@/hooks";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { useCallback, useState } from "react";
import { notification } from "./notification";

export default function BondMoreKtonModal({
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
  const { isStakingV2, calcExtraPower } = useStaking();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { ktonToken } = getChainConfig(activeChain);
  const { data: ktonBalance } = useBalance({ address, token: ktonToken?.address, query: { refetchInterval: 3000 } });

  const handleBond = useCallback(async () => {
    if ((ktonBalance?.value || 0n) < inputAmount) {
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
          args: [0n, inputAmount, []],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

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
  }, [activeChain, inputAmount, ktonBalance?.value, isStakingV2, walletClient, publicClient, onClose]);

  return (
    ktonToken && (
      <BondMoreTokenModal
        isOpen={isOpen}
        symbol={ktonToken.symbol}
        decimals={ktonToken.decimals}
        power={commissionWeightedPower(calcExtraPower(0n, inputAmount), commission)}
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
