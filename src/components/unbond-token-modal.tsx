import BalanceInput from "./balance-input";
import Modal from "./modal";

export default function UnbondTokenModal({
  isOpen,
  symbol,
  decimals,
  balance,
  power,
  busy,
  disabled,
  isReset,
  onCancel = () => undefined,
  onUnbond = () => undefined,
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
  onUnbond?: () => void;
  onClose?: () => void;
  onChange?: (amount: bigint) => void;
}) {
  return (
    <Modal
      title={`Unbond ${symbol}`}
      isOpen={isOpen}
      onCancel={onCancel}
      onClose={onClose}
      onOk={onUnbond}
      maskClosable={false}
      okText="Unbond"
      className="lg:w-[25rem]"
      busy={busy}
      disabled={disabled}
    >
      <>
        <p className="text-xs font-light text-white">This unbonding process will take 14 days to complete.</p>
        <div className="h-[1px] bg-white/20" />
        <BalanceInput
          label="Amount"
          boldLabel
          decimals={decimals}
          symbol={symbol}
          balance={balance}
          power={power}
          isReset={isReset}
          powerChanges="less"
          onChange={onChange}
        />
      </>
    </Modal>
  );
}
