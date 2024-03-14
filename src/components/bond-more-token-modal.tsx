import Modal from "./modal";

export default function BondMoreTokenModal({
  isOpen,
  symbol,
  onCancel = () => undefined,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  symbol: string;
  onCancel?: () => void;
  onClose?: () => void;
}) {
  return (
    <Modal
      title={`Bond More ${symbol}`}
      isOpen={isOpen}
      onCancel={onCancel}
      onClose={onClose}
      maskClosable={false}
      className="lg:w-[25rem]"
    >
      <div className="flex flex-col gap-small text-xs font-bold lg:text-sm lg:font-light">
        <span className="text-white">{`Please stake ${symbol} in`}</span>
        <a
          href="https://kton-staking.darwinia.network/"
          rel="noopener noreferrer"
          target="_blank"
          className="text-primary underline transition-opacity hover:opacity-80"
        >
          https://kton-staking.darwinia.network
        </a>
      </div>
    </Modal>
  );
}
