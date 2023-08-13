import { UnbondingInfo } from "@/types";
import { formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren, useCallback } from "react";
import { useApp } from "@/hooks";
import EnsureMatchNetworkButton from "./ensure-match-network-button";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";

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
  const { activeChain } = useApp();

  const unexpiredUnbondings = unbondings.filter(({ isExpired }) => !isExpired);
  const expiredUnbondings = unbondings.filter(({ isExpired }) => isExpired);

  const handleCancelUnbonding = useCallback(
    async (depositId: number) => {
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: contractAbi,
          functionName: "restake",
          args: [0n, 0n, [depositId]],
        });
        const receipt = await waitForTransaction({ hash });

        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }
    },
    [activeChain]
  );

  const handleRelease = useCallback(async () => {
    const { contract, explorer } = getChainConfig(activeChain);

    try {
      const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

      const { hash } = await writeContract({
        address: contract.staking.address,
        abi: contractAbi,
        functionName: "claim",
        args: [],
      });
      const receipt = await waitForTransaction({ hash });

      notifyTransaction(receipt, explorer);
    } catch (err) {
      console.error(err);
      notification.error({ description: (err as Error).message });
    }
  }, [activeChain]);

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
                onClick={() => handleCancelUnbonding(depositId)}
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
              <EnsureMatchNetworkButton className="text-primary" onClick={handleRelease}>
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
