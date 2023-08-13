import { UnbondingInfo } from "@/types";
import { formatBlanace } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";

interface Props {
  unbondings: UnbondingInfo[];
  token: { symbol: string; decimals: number };
  onCancelUnbonding: (ring: bigint, kton: bigint, depositIds: number[]) => Promise<void>;
  onRelease: (type: "ring" | "kton" | "deposit") => Promise<void>;
}

export default function UnbondingDepositTooltip({
  children,
  unbondings,
  token,
  onCancelUnbonding,
  onRelease,
}: PropsWithChildren<Props>) {
  return (
    <Tooltip
      content={
        <UnbondingDeposit
          unbondings={unbondings}
          token={token}
          onCancelUnbonding={onCancelUnbonding}
          onRelease={onRelease}
        />
      }
      className="w-fit"
      contentClassName="w-11/12 lg:w-80 overflow-y-auto max-h-[40vh]"
      enabled={unbondings.length > 0}
      enabledSafePolygon
    >
      {children}
    </Tooltip>
  );
}

function UnbondingDeposit({ unbondings, token, onCancelUnbonding, onRelease }: Props) {
  const unexpiredUnbondings = unbondings.filter(({ isExpired }) => !isExpired);
  const expiredUnbondings = unbondings.filter(({ isExpired }) => isExpired);

  return (
    <div className="flex flex-col gap-middle lg:p-middle">
      {unexpiredUnbondings.length > 0 && (
        <div className="flex flex-col gap-small">
          {unexpiredUnbondings.map(({ amount, depositId, expiredAtBlock, expiredTimestamp }, index) => (
            <p
              key={`${index}${depositId}${amount.toString()}${expiredAtBlock}${expiredTimestamp}`}
              className="text-xs font-light text-white"
            >
              {`#${index + 1} ${formatBlanace(amount, token.decimals, { keepZero: false })} Deposit ${
                token.symbol
              } is unbonding and will be released to deposit in ${formatDistanceStrict(
                expiredTimestamp,
                Date.now()
              )}. `}
              <EnsureMatchNetworkButton
                className="font-bold text-primary"
                onClick={() => onCancelUnbonding(0n, 0n, [depositId])}
              >
                Cancel Unbonding
              </EnsureMatchNetworkButton>
            </p>
          ))}
        </div>
      )}
      {expiredUnbondings.length > 0 && (
        <div className="flex flex-col gap-small">
          {expiredUnbondings.map(({ amount, depositId, expiredAtBlock, expiredTimestamp }, index) => (
            <p
              key={`${index}${depositId}${amount.toString()}${expiredAtBlock}${expiredTimestamp}`}
              className="text-xs font-bold text-white"
            >
              {`#${index + 1} ${formatBlanace(amount, token.decimals, { keepZero: false })} ${
                token.symbol
              } has complete the unbonding exit delay period.  `}
              <EnsureMatchNetworkButton className="text-primary" onClick={() => onRelease("deposit")}>
                Release them
              </EnsureMatchNetworkButton>
              {` to term deposit.`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
