import { commissionWeightedPower, formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import UnbondTokenModal from "./unbond-token-modal";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

export default function UnbondRingModal({
  commission,
  isOpen,
  onClose = () => undefined,
}: {
  commission: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { stakedRing, isStakingV2, calcExtraPower } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { nativeToken } = getChainConfig(activeChain);

  const handleUnbond = useCallback(async () => {
    if (stakedRing < inputAmount) {
      notification.warn({
        description: `You can't unbond more than ${formatBlanace(stakedRing, nativeToken.decimals, {
          precision: 4,
          keepZero: false,
        })} ${nativeToken.symbol}`,
      });
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
          functionName: "unstake",
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
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [activeChain, stakedRing, inputAmount, nativeToken, isStakingV2, walletClient, publicClient, onClose]);

  return (
    <UnbondTokenModal
      isOpen={isOpen}
      symbol={nativeToken.symbol}
      decimals={nativeToken.decimals}
      power={commissionWeightedPower(calcExtraPower(inputAmount, 0n), commission)}
      balance={stakedRing}
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
