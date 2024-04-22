import BalanceInput from "./balance-input";
import Modal from "./modal";

export default function BondMoreTokenModal({
  isOpen,
  symbol,
  decimals,
  max,
  balance,
  busy,
  disabled,
  isReset,
  onCancel = () => undefined,
  onBond = () => undefined,
  onClose = () => undefined,
  onChange = () => undefined,
}: {
  isOpen: boolean;
  symbol: string;
  decimals: number;
  max: bigint;
  balance: bigint;
  busy?: boolean;
  disabled?: boolean;
  isReset?: boolean;
  onCancel?: () => void;
  onBond?: () => void;
  onClose?: () => void;
  onChange?: (amount: bigint) => void;
}) {
  const isKton = symbol.endsWith("KTON");

  return (
    <Modal
      title={`Bond More ${symbol}`}
      isOpen={isOpen}
      onCancel={onCancel}
      onClose={onClose}
      onOk={isKton ? undefined : onBond}
      maskClosable={false}
      okText="Bond"
      className="lg:w-[25rem]"
      busy={busy}
      disabled={disabled}
    >
      {isKton ? (
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
      ) : (
        <BalanceInput
          label="Amount"
          boldLabel
          decimals={decimals}
          symbol={symbol}
          balance={balance}
          max={max}
          isReset={isReset}
          onChange={onChange}
        />
      )}
    </Modal>
  );
}
