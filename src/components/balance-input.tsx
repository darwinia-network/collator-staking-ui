import { formatBlanace, prettyNumber } from "@/utils";
import Image from "next/image";
import InputLabel from "./input-label";
import { parseUnits } from "viem";
import { useEffect, useRef, useState } from "react";

type PowerChanges = "more" | "less";

export default function BalanceInput({
  isReset,
  balance,
  symbol,
  decimals,
  logoPath,
  power,
  label,
  boldLabel,
  className,
  powerChanges = "more",
  onChange = () => undefined,
}: {
  isReset?: boolean;
  balance: bigint;
  symbol: string;
  decimals: number;
  logoPath?: string;
  power?: bigint;
  powerChanges?: PowerChanges;
  label?: string;
  boldLabel?: boolean;
  className?: string;
  onChange?: (amount: bigint) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isReset && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [isReset]);

  return (
    <div className={`flex flex-col gap-middle ${className}`}>
      {label && <InputLabel label={label} bold={boldLabel} />}
      <div
        className={`flex h-10 items-center justify-between gap-middle border px-middle ${
          hasError ? "border-red-500" : "border-white"
        }`}
      >
        <input
          placeholder={`Balance: ${formatBlanace(balance, decimals, { keepZero: false, precision: 4 })}`}
          className="h-full w-[72%] bg-transparent text-sm font-light focus-visible:outline-none"
          onChange={(e) => {
            const _hasError = Number.isNaN(Number(e.target.value));
            setHasError(_hasError || balance < parseUnits(e.target.value, decimals));

            if (!_hasError) {
              onChange(parseUnits(e.target.value, decimals));
            }
          }}
          ref={inputRef}
        />
        <div className="flex items-center gap-middle">
          {logoPath && <Image alt={symbol} width={20} height={20} src={logoPath} />}
          <span className="text-sm font-light text-white">{symbol}</span>
        </div>
      </div>
      {power !== undefined && <ExtraPower power={power} powerChanges={powerChanges} />}
    </div>
  );
}

export function ExtraPower({ power, powerChanges = "more" }: { power: bigint; powerChanges?: PowerChanges }) {
  return (
    <span className="text-xs font-bold text-primary">{`${powerChanges === "more" ? "+" : "-"}${prettyNumber(
      power
    )} Power`}</span>
  );
}
