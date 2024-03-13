import { Key, useCallback, useMemo, useState } from "react";
import Modal from "./modal";
import CheckboxGroup from "./checkbox-group";
import { commissionWeightedPower, formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import { ExtraPower } from "./balance-input";
import { useApp, useStaking } from "@/hooks";
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

export default function BondMoreDepositModal({
  commission,
  isOpen,
  onClose = () => undefined,
}: {
  commission: string;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const { deposits, isStakingV2, calcExtraPower } = useStaking();
  const { activeChain } = useApp();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [checkedDeposits, setCheckedDeposits] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const extraPower = useMemo(
    () =>
      commissionWeightedPower(
        calcExtraPower(
          deposits.filter(({ id }) => checkedDeposits.includes(id)).reduce((acc, cur) => acc + cur.value, 0n),
          0n
        ),
        commission
      ),
    [deposits, commission, checkedDeposits, calcExtraPower]
  );

  const availableDeposits = deposits.filter(({ inUse }) => !inUse);
  const { nativeToken } = getChainConfig(activeChain);

  const handleBond = useCallback(async () => {
    if (walletClient && publicClient) {
      setBusy(true);
      const { contract, explorer } = getChainConfig(activeChain);

      try {
        const abi = isStakingV2
          ? (await import("@/config/abi/staking-v2.json")).default
          : (await import("@/config/abi/staking.json")).default;

        const hash = await walletClient.writeContract({
          address: contract.staking.address,
          abi,
          functionName: "stake",
          args: [0n, 0n, checkedDeposits],
        });
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          setCheckedDeposits([]);
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [activeChain, isStakingV2, checkedDeposits, walletClient, publicClient, onClose]);

  return (
    <Modal
      title="Bond More Deposits"
      isOpen={isOpen}
      maskClosable={false}
      okText="Bond"
      onCancel={onClose}
      onClose={onClose}
      onOk={handleBond}
      className="lg:w-[25rem]"
      disabled={checkedDeposits.length <= 0}
      busy={busy}
    >
      {availableDeposits.length ? (
        <>
          <CheckboxGroup
            options={availableDeposits.map(({ id, value }) => ({
              value: id,
              label: (
                <div key={id} className="flex w-full items-center justify-between">
                  <span className="text-sm font-light text-white">{`ID#${id}`}</span>
                  <span className="text-sm font-light text-white">{`${formatBlanace(value, nativeToken.decimals, {
                    keepZero: false,
                  })} ${nativeToken.symbol}`}</span>
                </div>
              ),
            }))}
            checkedValues={checkedDeposits}
            onChange={setCheckedDeposits as (values: Key[]) => void}
            className="max-h-80 overflow-y-auto"
          />

          <div className="h-[1px] bg-white/20" />

          <ExtraPower power={extraPower} />
        </>
      ) : (
        <span className="text-xs font-light text-white">No more deposits to bond</span>
      )}
    </Modal>
  );
}
