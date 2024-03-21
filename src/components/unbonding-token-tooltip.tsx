import { UnbondingInfo } from "@/types";
import { formatBlanace } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";

interface Props {
  unbondings: Omit<UnbondingInfo, "depositId">[];
  token: { symbol: string; decimals: number };
  onCancelUnbonding: (ring: bigint, kton: bigint, depositIds: number[]) => Promise<void>;
  onRelease: (type: "ring" | "kton" | "deposit") => Promise<void>;
}

export default function UnbondingTokenTooltip({
  children,
  unbondings,
  token,
  onCancelUnbonding,
  onRelease,
}: PropsWithChildren<Props>) {
  return (
    <Tooltip
      content={
        <UnbondingToken
          unbondings={unbondings}
          token={token}
          onCancelUnbonding={onCancelUnbonding}
          onRelease={onRelease}
        />
      }
      className="w-fit"
      contentClassName="w-11/12 lg:w-96 overflow-y-auto max-h-[40vh]"
      enabled={unbondings.length > 0}
      enabledSafePolygon
    >
      {children}
    </Tooltip>
  );
}

function UnbondingToken({ unbondings, token, onCancelUnbonding, onRelease }: Props) {
  const unexpiredUnbondings = unbondings.filter(({ isExpired }) => !isExpired);
  const expiredUnbondings = unbondings.filter(({ isExpired }) => isExpired);
  const isKton = token.symbol.endsWith("KTON");

  return (
    <div className="flex flex-col gap-middle lg:p-middle">
      {unexpiredUnbondings.length > 0 && (
        <div className="flex flex-col gap-small">
          {unexpiredUnbondings.map(({ amount, expiredAtBlock, expiredTimestamp }, index) => (
            <p
              key={`${index}${amount.toString()}${expiredAtBlock}${expiredTimestamp}`}
              className="text-xs font-light text-white"
            >
              {`#${index + 1} ${formatBlanace(amount, token.decimals, { keepZero: false })} ${
                token.symbol
              } is unbonding and will be released in ${formatDistanceStrict(expiredTimestamp, Date.now())}. `}
              {isKton ? null : (
                <EnsureMatchNetworkButton
                  className="font-bold text-primary"
                  onClick={() => onCancelUnbonding(isKton ? 0n : amount, isKton ? amount : 0n, [])}
                >
                  Cancel Unbonding
                </EnsureMatchNetworkButton>
              )}
            </p>
          ))}
        </div>
      )}
      {expiredUnbondings.length > 0 && (
        <div className="flex flex-col gap-small">
          {expiredUnbondings.map(({ amount, expiredAtBlock, expiredTimestamp }, index) => (
            <p
              key={`${index}${amount.toString()}${expiredAtBlock}${expiredTimestamp}`}
              className="text-xs font-bold text-white"
            >
              {`#${index + 1} ${formatBlanace(amount, token.decimals, { keepZero: false })} ${
                token.symbol
              } has complete the unbonding exit delay period. `}
              <EnsureMatchNetworkButton className="text-primary" onClick={() => onRelease(isKton ? "kton" : "ring")}>
                Release them Now
              </EnsureMatchNetworkButton>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
