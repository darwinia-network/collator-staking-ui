import { UnbondingInfo } from "@/types";
import { formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import { formatDistanceStrict } from "date-fns";
import Tooltip from "./tooltip";
import { PropsWithChildren, useCallback } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";
import { useApp } from "@/hooks";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { notification } from "./notification";

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
  const { activeChain } = useApp();

  const unexpiredUnbondings = unbondings.filter(({ isExpired }) => !isExpired);
  const expiredUnbondings = unbondings.filter(({ isExpired }) => isExpired);

  const handleCancelUnbonding = useCallback(
    async (amount: bigint) => {
      const { contract, explorer } = getChainConfig(activeChain);
      const isKton = token.symbol.endsWith("KTON");

      try {
        const contractAbi = (await import(`@/config/abi/${contract.staking.abiFile}`)).default;

        const { hash } = await writeContract({
          address: contract.staking.address,
          abi: contractAbi,
          functionName: "restake",
          args: [isKton ? 0n : amount, isKton ? amount : 0n, []],
        });
        const receipt = await waitForTransaction({ hash });

        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }
    },
    [activeChain, token.symbol]
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
          {unexpiredUnbondings.map(({ amount, expiredAtBlock, expiredTimestamp }, index) => (
            <p
              key={`${index}${amount.toString()}${expiredAtBlock}${expiredTimestamp}`}
              className="text-xs font-light text-white"
            >
              {`#${index + 1} ${formatBlanace(amount, token.decimals, { keepZero: false })} ${
                token.symbol
              } is unbonding and will be released in ${formatDistanceStrict(expiredTimestamp, Date.now())}. `}
              <EnsureMatchNetworkButton
                className="font-bold text-primary"
                onClick={() => handleCancelUnbonding(amount)}
              >
                Cancel Unbonding
              </EnsureMatchNetworkButton>
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
              <EnsureMatchNetworkButton className="text-primary" onClick={handleRelease}>
                Release them Now
              </EnsureMatchNetworkButton>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
