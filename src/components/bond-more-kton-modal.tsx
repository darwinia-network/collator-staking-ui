import { getChainConfig } from "@/utils";
import BondMoreTokenModal from "./bond-more-token-modal";
import { useApp } from "@/hooks";

export default function BondMoreKtonModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { activeChain } = useApp();
  const { ktonToken } = getChainConfig(activeChain);

  return (
    ktonToken && <BondMoreTokenModal isOpen={isOpen} symbol={ktonToken.symbol} onClose={onClose} onCancel={onClose} />
  );
}
