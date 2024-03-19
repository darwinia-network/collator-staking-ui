import { calcKtonReward, formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import BalanceInput from "./balance-input";
import DepositTermSelector from "./deposit-term-selector";
import InputLabel from "./input-label";
import { useAccount, useBalance } from "wagmi";
import { useApp, useStaking } from "@/hooks";
import { useCallback, useState } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";
import { notification } from "./notification";
import { writeContract, waitForTransaction } from "@wagmi/core";

export default function DoDeposit() {
  const [depositRing, setDepositRing] = useState(0n);
  const [depositTerm, setDepositTerm] = useState(1);
  const [busy, setBusy] = useState(false);

  const { address } = useAccount();
  const { data: ringBalance } = useBalance({ address, watch: true });
  const { minimumDeposit } = useStaking();
  const { activeChain } = useApp();

  const chainConfig = getChainConfig(activeChain);

  const handleDeposit = useCallback(async () => {
    if (depositRing < minimumDeposit) {
      notification.warn({
        description: `Please deposit at least ${formatBlanace(minimumDeposit, chainConfig.nativeToken.decimals, {
          keepZero: false,
        })} ${chainConfig.nativeToken.symbol}.`,
      });
      return;
    } else if ((ringBalance?.value || 0n) < depositRing) {
      notification.warn({ description: "Your balance is insufficient." });
      return;
    } else {
      setBusy(true);

      try {
        const contractAbi = (await import(`@/config/abi/${chainConfig.contract.deposit.abiFile}`)).default;

        const { hash } = await writeContract({
          address: chainConfig.contract.deposit.address,
          abi: contractAbi,
          functionName: "lock",
          args: [depositRing, depositTerm],
        });
        const receipt = await waitForTransaction({ hash });

        if (receipt.status === "success") {
          setDepositRing(0n);
          setDepositTerm(1);
        }
        notifyTransaction(receipt, chainConfig.explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [
    depositRing,
    depositTerm,
    minimumDeposit,
    chainConfig.contract.deposit,
    chainConfig.explorer,
    chainConfig.nativeToken,
    ringBalance?.value,
  ]);

  return (
    <div className="flex flex-col gap-middle bg-component p-5">
      <h5 className="text-sm font-bold text-white">Term Deposit</h5>
      <span className="text-xs font-light text-white/50">
        Deposit RING for a fixed term and earn KTON, and the RING in deposit can used in Staking as Well. Note that if
        you withdraw the funds before the term ends, you have to pay 3 times the reward as a penalty.
      </span>

      <div className="h-[1px] bg-white/20" />

      <div className="flex flex-col gap-middle lg:flex-row">
        {/* amount */}
        <BalanceInput
          label="Amount"
          balance={ringBalance?.value || 0n}
          symbol={chainConfig.nativeToken.symbol}
          decimals={chainConfig.nativeToken.decimals}
          logoPath={chainConfig.nativeToken.logoPath}
          className="lg:flex-1"
          onChange={setDepositRing}
          isReset={depositRing <= 0}
        />

        {/* deposit term */}
        <div className="flex flex-col gap-middle lg:flex-1">
          <InputLabel label="Deposit term" />
          <DepositTermSelector activeTerm={depositTerm} onChange={setDepositTerm} />
        </div>

        {/* reward */}
        <div className="flex flex-col gap-middle lg:flex-1">
          <InputLabel label="Reward you'll receive" />
          <div className="flex h-10 items-center justify-between bg-primary px-middle">
            <span className="text-sm font-bold text-white">
              {formatBlanace(calcKtonReward(depositRing, depositTerm), chainConfig.ktonToken?.decimals, {
                precision: 6,
              })}
            </span>
            <span className="text-sm font-bold text-white">{chainConfig.ktonToken?.symbol}</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-white/20" />

      <EnsureMatchNetworkButton
        disabled={!(depositRing > 0)}
        busy={busy}
        className="bg-primary px-large py-middle text-sm font-bold text-white transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 lg:w-40"
        onClick={handleDeposit}
      >
        Deposit
      </EnsureMatchNetworkButton>
    </div>
  );
}
