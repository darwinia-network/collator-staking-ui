import { getChainConfig } from "@/utils";
import UnbondTokenModal from "./unbond-token-modal";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";

export default function UnbondKtonModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { stakedKton } = useStaking();

  const [inputAmount, setInputAmount] = useState(0n);
  const [busy, setBusy] = useState(false);

  const { ktonToken } = getChainConfig(activeChain);

  const handleUnbond = useCallback(() => setBusy(false), []);

  return (
    ktonToken && (
      <UnbondTokenModal
        isOpen={isOpen}
        symbol={ktonToken.symbol}
        decimals={ktonToken.decimals}
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
