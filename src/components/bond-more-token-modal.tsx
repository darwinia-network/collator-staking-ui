import BalanceInput from "./balance-input";
import Modal from "./modal";

export default function BondMoreTokenModal({
  isOpen,
  symbol,
  decimals,
  balance,
  power,
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
  balance: bigint;
  power: bigint;
  busy?: boolean;
  disabled?: boolean;
  isReset?: boolean;
  onCancel?: () => void;
  onBond?: () => void;
  onClose?: () => void;
  onChange?: (amount: bigint) => void;
}) {
  return (
    <Modal
      title={`Bond More ${symbol}`}
      isOpen={isOpen}
      onCancel={onCancel}
      onClose={onClose}
      onOk={onBond}
      maskClosable={false}
      okText="Bond"
      className="lg:w-[25rem]"
      busy={busy}
      disabled={disabled}
    >
      <BalanceInput
        label="Amount"
        boldLabel
        decimals={decimals}
        symbol={symbol}
        balance={balance}
        power={power}
        isReset={isReset}
        onChange={onChange}
      />
    </Modal>
  );
}
