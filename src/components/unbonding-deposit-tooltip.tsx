import { UnbondingInfo } from "@/types";
import { formatBlanace } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren } from "react";

export default function UnbondingDepositTooltip({
  children,
  unbondings,
  token,
}: PropsWithChildren<{
  unbondings: UnbondingInfo[];
  token: { symbol: string; decimals: number };
}>) {
  return (
    <Tooltip
      content={<UnbondingDeposit unbondings={unbondings} token={token} />}
      className="w-fit"
      contentClassName="w-11/12 lg:w-80 overflow-y-auto max-h-[40vh]"
      enabled={unbondings.length > 0}
      enabledSafePolygon
    >
      {children}
    </Tooltip>
  );
}

function UnbondingDeposit({
  unbondings,
  token,
}: {
  unbondings: UnbondingInfo[];
  token: { symbol: string; decimals: number };
}) {
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
              <span className="font-bold text-primary transition-opacity hover:cursor-pointer hover:opacity-80 active:opacity-60">
                Cancel Unbonding
              </span>
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
              <span className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80 active:opacity-60">
                Release them
              </span>
              {` to term deposit.`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
