import { useApp } from "@/hooks";
import Modal from "./modal";
import { formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
import { Deposit } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

export type WithdrawType = "early" | "regular";

export default function WithdrawModal({
  deposit,
  type,
  isOpen,
  onClose = () => undefined,
}: {
  deposit?: Deposit;
  type?: WithdrawType;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const { activeChain } = useApp();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const chainConfig = getChainConfig(activeChain);

  const okText = useMemo(() => {
    if (type === "early" && deposit) {
      return `Pay ${formatBlanace(deposit.reward * 3n, chainConfig.ktonToken?.decimals, {
        keepZero: false,
        precision: 6,
      })} ${chainConfig.ktonToken?.symbol}`;
    }
    return "Withdraw";
  }, [type, deposit, chainConfig.ktonToken]);

  const handleWithdraw = useCallback(async () => {
    setBusy(true);

    if (walletClient && publicClient) {
      try {
        const abi = (await import(`@/config/abi/${chainConfig.contract.deposit.abiFile}`)).default;

        const hash = await (type === "early"
          ? walletClient.writeContract({
              address: chainConfig.contract.deposit.address,
              abi,
              functionName: "claim_with_penalty",
              args: [deposit?.id ?? 0],
            })
          : walletClient.writeContract({
              address: chainConfig.contract.deposit.address,
              abi,
              functionName: "claim",
              args: [],
            }));
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          onClose();
        }
        notifyTransaction(receipt, chainConfig.explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }
    }

    setBusy(false);
  }, [type, chainConfig.contract.deposit, chainConfig.explorer, deposit?.id, walletClient, publicClient, onClose]);

  return (
    <Modal
      title="Sure to withdraw now?"
      isOpen={isOpen}
      okText={okText}
      onOk={handleWithdraw}
      onCancel={onClose}
      onClose={onClose}
      className="lg:w-[560px]"
      busy={busy}
    >
      {type === "early" ? (
        <p className="text-sm font-light text-white">{`Since the Deposit Term doesn't end yet, you'll be charged a penalty of 3 times the ${chainConfig.ktonToken?.symbol} reward if you try to withdraw the ${chainConfig.nativeToken.symbol}s in advance.`}</p>
      ) : (
        <p className="text-sm font-light text-white">Withdraw at a regular time</p>
      )}
    </Modal>
  );
}
