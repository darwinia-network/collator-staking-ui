import { getChainConfig, notifyTransaction } from "@/utils";
import ActiveDepositSelector from "./active-deposit-selector";
import CollatorSelector from "./collator-selector";
import BalanceInput, { ExtraPower } from "./balance-input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp, useStaking } from "@/hooks";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import EnsureMatchNetworkButton from "./ensure-match-network-button";
import { clientBuilder } from "@/libs";
import { ChainID } from "@/types";
import { notification } from "./notification";

export default function DoStake() {
  const { deposits, nominatorCollators, isNominatorCollatorsLoading, calcExtraPower, updateNominatorCollators } =
    useStaking();
  const [delegateCollator, setDelegateCollator] = useState<string | undefined>(undefined);
  const [delegateRing, setDelegateRing] = useState(0n);
  const [delegateKton, setDelegateKton] = useState(0n);
  const [delegateDeposits, setDelegateDeposits] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const { activeChain } = useApp();
  const { nativeToken, ktonToken, explorer } = getChainConfig(activeChain);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { data: ringBalance } = useBalance({ address, watch: true });
  const { data: ktonBalance } = useBalance({ address, watch: true, token: ktonToken?.address });

  const ringExtraPower = useMemo(() => calcExtraPower(delegateRing, 0n), [delegateRing, calcExtraPower]);
  const ktonExtraPower = useMemo(() => calcExtraPower(0n, delegateKton), [delegateKton, calcExtraPower]);
  const depositsExtraPower = useMemo(
    () =>
      calcExtraPower(
        deposits.filter(({ id }) => delegateDeposits.includes(id)).reduce((acc, cur) => acc + cur.value, 0n),
        0n
      ),
    [delegateDeposits, deposits, calcExtraPower]
  );

  const handleStake = useCallback(async () => {
    if (delegateCollator && walletClient) {
      setBusy(true);

      try {
        const client =
          activeChain === ChainID.CRAB
            ? clientBuilder.buildCrabClient(publicClient)
            : clientBuilder.buildDarwiniaClient(publicClient);

        const nominateCall = client.calls.darwiniaStaking.buildNominateCall(delegateCollator);
        const stakeCall = client.calls.darwiniaStaking.buildStakeCall(delegateRing, delegateKton, delegateDeposits);
        const receipt = await client.calls.utility.batchAll(walletClient, [stakeCall, nominateCall]);

        if (receipt.status === "success") {
          updateNominatorCollators();
          setDelegateRing(0n);
          setDelegateKton(0n);
          setDelegateDeposits([]);
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [
    activeChain,
    delegateCollator,
    delegateDeposits,
    delegateKton,
    delegateRing,
    explorer,
    publicClient,
    walletClient,
    updateNominatorCollators,
  ]);

  useEffect(() => {
    if (address && nominatorCollators[address]?.length) {
      setDelegateCollator((prev) => prev ?? nominatorCollators[address]?.at(0));
    }
  }, [address, nominatorCollators]);

  return (
    <div className="flex flex-col gap-middle bg-component p-5">
      <h5 className="text-sm font-bold text-white">Delegate</h5>
      <span className="text-xs font-light text-white/50">
        Note that it takes 1 Session(~24 hours) to get rewards if your collator get elected. The delegation locks your
        tokens, and You need to unbond in order for your staked tokens to be transferrable again, which takes ~14 days.
      </span>

      <div className="h-[1px] bg-white/20" />

      {/* collator */}
      <CollatorSelector collator={delegateCollator} onSelect={setDelegateCollator} />

      <div className="flex flex-col gap-middle lg:flex-row">
        {/* ring */}
        <BalanceInput
          balance={ringBalance?.value || 0n}
          symbol={nativeToken.symbol}
          logoPath={nativeToken.logoPath}
          decimals={nativeToken.decimals}
          power={ringExtraPower}
          className="lg:flex-1"
          onChange={setDelegateRing}
          isReset={delegateRing <= 0}
        />

        {/* kton */}
        {ktonToken && (
          <>
            <BalanceInput
              balance={ktonBalance?.value || 0n}
              symbol={ktonToken.symbol}
              logoPath={ktonToken.logoPath}
              decimals={ktonToken.decimals}
              power={ktonExtraPower}
              className="lg:flex-1"
              onChange={setDelegateKton}
              isReset={delegateKton <= 0}
            />
          </>
        )}

        {/* active deposit */}
        <div className="flex flex-col gap-middle lg:flex-1">
          <ActiveDepositSelector checkedDeposits={delegateDeposits} onChange={setDelegateDeposits} />
          <ExtraPower power={depositsExtraPower} />
        </div>
      </div>

      <div className="h-[1px] bg-white/20" />

      <EnsureMatchNetworkButton
        busy={busy || isNominatorCollatorsLoading}
        disabled={!delegateCollator || delegateDeposits.length <= 0}
        className="bg-primary px-large py-middle text-sm font-bold text-white lg:w-40"
        onClick={handleStake}
      >
        Stake
      </EnsureMatchNetworkButton>
    </div>
  );
}
