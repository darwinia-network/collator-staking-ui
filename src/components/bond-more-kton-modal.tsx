import { getChainConfig } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useApp } from "@/hooks";
import { useAccount, useBalance } from "wagmi";
import { useCallback, useState } from "react";

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

  const handleBond = useCallback(() => setBusy(false), []);

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
