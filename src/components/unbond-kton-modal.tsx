import { commissionWeightedPower, formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import UnbondTokenModal from "./unbond-token-modal";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { ChainID } from "@/types";

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
  const { stakedKton, calcExtraPower } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { ktonToken, contract, explorer } = getChainConfig(activeChain);

  const handleUnbond = useCallback(async () => {
    if (stakedKton < inputAmount) {
      notification.warn({
        description: `You can't unbond more than ${formatBlanace(stakedKton, ktonToken?.decimals, {
          precision: 4,
          keepZero: false,
        })} ${ktonToken?.symbol}`,
      });
    } else {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const abi =
          activeChain === ChainID.CRAB
            ? (await import("@/config/abi/staking-v2.json")).default
            : (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: contract.staking.address,
          abi,
          functionName: "unstake",
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
  }, [activeChain, stakedKton, inputAmount, ktonToken, onClose]);

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
