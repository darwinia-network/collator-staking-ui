import { commissionWeightedPower, formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import UnbondTokenModal from "./unbond-token-modal";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

export default function UnbondKtonModal({
  commission,
  isOpen,
  onClose = () => undefined,
}: {
  commission: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { stakedKton, isStakingV2, calcExtraPower } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { ktonToken } = getChainConfig(activeChain);

  const handleUnbond = useCallback(async () => {
    if (stakedKton < inputAmount) {
      notification.warn({
        description: `You can't unbond more than ${formatBlanace(stakedKton, ktonToken?.decimals, {
          precision: 4,
          keepZero: false,
        })} ${ktonToken?.symbol}`,
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
  }, [activeChain, stakedKton, inputAmount, ktonToken, isStakingV2, walletClient, publicClient, onClose]);

  return (
    ktonToken && (
      <UnbondTokenModal
        isOpen={isOpen}
        symbol={ktonToken.symbol}
        decimals={ktonToken.decimals}
        power={commissionWeightedPower(calcExtraPower(0n, inputAmount), commission)}
        balance={stakedKton}
        busy={busy}
        disabled={inputAmount <= 0n}
        isReset={inputAmount <= 0}
        onClose={onClose}
        onUnbond={handleUnbond}
        onCancel={onClose}
        onChange={setInputAmount}
      />
    )
  );
}
