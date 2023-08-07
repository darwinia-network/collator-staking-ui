import { UnbondingInfo } from "@/types";
import { formatBlanace } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren } from "react";

export default function UnbondingTokenTooltip({
  children,
  unbondings,
  token,
}: PropsWithChildren<{
  unbondings: Omit<UnbondingInfo, "depositId">[];
  token: { symbol: string; decimals: number };
}>) {
  return (
    <Tooltip
      content={<UnbondingToken unbondings={unbondings} token={token} />}
      className="w-fit"
      contentClassName="w-11/12 lg:w-96 overflow-y-auto max-h-[40vh]"
      enabled={unbondings.length > 0}
      enabledSafePolygon
    >
      {children}
    </Tooltip>
  );
}

function UnbondingToken({
  unbondings,
  token,
}: {
  unbondings: Omit<UnbondingInfo, "depositId">[];
  token: { symbol: string; decimals: number };
}) {
  const unexpiredUnbondings = unbondings.filter(({ isExpired }) => !isExpired);
  const expiredUnbondings = unbondings.filter(({ isExpired }) => isExpired);

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
              <span className="font-bold text-primary transition-opacity hover:cursor-pointer hover:opacity-80 active:opacity-60">
                Cancel Unbonding
              </span>
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
              <span className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80 active:opacity-60">
                Release them Now
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
