import { ButtonHTMLAttributes, useCallback, useMemo, useState } from "react";
import Modal from "./modal";
import Tabs from "./tabs";
import CollatorInput from "./collator-input";
import EnsureMatchNetworkButton from "./ensure-match-network-button";
import { usePublicClient, useWalletClient } from "wagmi";
import { useApp, useStaking } from "@/hooks";
import { notification } from "./notification";
import { getChainConfig, notifyTransaction } from "@/utils";
import { ChainID } from "@/types";
import { clientBuilder } from "@/libs";

enum TabKey {
  UPDATE_SESSION_KEY,
  UPDATE_COMMISSION,
  STOP_COLLATION,
}

export default function ManageCollator({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { activeChain } = useApp();
  const { maxCommission, updateCollatorCommission } = useStaking();

  const [activeKey, setActiveKey] = useState(TabKey.UPDATE_SESSION_KEY);
  const [sessionKey, setSessionKey] = useState("");
  const [commission, setCommission] = useState("");
  const [busy, setBusy] = useState(false);

  const client = useMemo(
    () =>
      publicClient
        ? activeChain === ChainID.CRAB
          ? clientBuilder.buildCrabClient(publicClient)
          : clientBuilder.buildDarwiniaClient(publicClient)
        : null,
    [activeChain, publicClient]
  );
  const { explorer, contract } = getChainConfig(activeChain);

  const handleUpdateSessionKey = useCallback(async () => {
    if (walletClient && client?.calls.session) {
      setBusy(true);

      try {
        // we appended 00 to the session key to represent that we don't need any proof. Originally the setKeys method
        // required two params which are session key and proof but here we append both values into one param
        const proof = `${sessionKey}00` as `0x${string}`;
        const receipt = await client.calls.session.setKeysH(walletClient, proof);

        if (receipt.status === "success") {
          setSessionKey("");
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [client?.calls.session, explorer, sessionKey, walletClient, onClose]);

  const handleUpdateCommission = useCallback(async () => {
    const commissionValue = Number(commission);

    if (Number.isNaN(commissionValue) || commissionValue < 0 || maxCommission < commissionValue) {
      notification.error({ description: `Invalid commission, the valid commission is 0%~${maxCommission}%.` });
    } else if (walletClient && publicClient) {
      setBusy(true);

      try {
        const hash = await walletClient.writeContract({
          address: contract.staking.address,
          abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
          functionName: "collect",
          args: [commissionValue],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          updateCollatorCommission();
          setCommission("");
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [
    commission,
    contract.staking,
    explorer,
    maxCommission,
    walletClient,
    publicClient,
    updateCollatorCommission,
    onClose,
  ]);

  const handleStopCollator = useCallback(async () => {
    if (walletClient && publicClient) {
      setBusy(true);

      try {
        const hash = await walletClient.writeContract({
          address: contract.staking.address,
          abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
          functionName: "chill",
          args: [],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          updateCollatorCommission();
          onClose();
        }
        notifyTransaction(receipt, explorer);
      } catch (err) {
        console.error(err);
        notification.error({ description: (err as Error).message });
      }

      setBusy(false);
    }
  }, [contract.staking, explorer, walletClient, publicClient, updateCollatorCommission, onClose]);

  return (
    <Modal
      title="Manage Collator"
      isOpen={isOpen}
      onClose={onClose}
      maskClosable={false}
      className="lg:h-[25rem] lg:w-[45rem]"
      btnWrapClassName="lg:flex-row"
      btnClassName="lg:w-40"
    >
      <Tabs
        items={[
          {
            key: TabKey.UPDATE_SESSION_KEY,
            label: <span>Update Session Key</span>,
            children: (
              <div className="flex flex-col gap-large">
                <CollatorInput label="Session Key" placeholder="Session key" onChange={setSessionKey} />
                <div className="h-[1px] bg-white/20" />
                <Button disabled={!sessionKey} busy={busy} onClick={handleUpdateSessionKey}>
                  <span>Update</span>
                </Button>
              </div>
            ),
          },
          {
            key: TabKey.UPDATE_COMMISSION,
            label: <span>Update Commission</span>,
            children: (
              <div className="flex flex-col gap-large">
                <CollatorInput
                  label="Commission (%)"
                  placeholder={`Please enter 0~${maxCommission}`}
                  suffix="%"
                  tooltip="The percent a collator takes off the top of the due staking rewards."
                  onChange={setCommission}
                />
                <div className="h-[1px] bg-white/20" />
                <Button disabled={!commission} busy={busy} onClick={handleUpdateCommission}>
                  <span>Update</span>
                </Button>
              </div>
            ),
          },
          {
            key: TabKey.STOP_COLLATION,
            label: <span>Stop Collation</span>,
            children: (
              <div className="flex flex-col gap-large">
                <p className="text-xs font-light text-white">
                  Collators maintain parachains by collecting parachain transactions from users and producing state
                  transition proofs for Relay Chain validators. Sure to stop collation now?
                </p>
                <div className="h-[1px] bg-white/20" />
                <Button busy={busy} onClick={handleStopCollator}>
                  <span>Stop</span>
                </Button>
              </div>
            ),
          },
        ]}
        activeKey={activeKey}
        onChange={setActiveKey}
        labelClassName="min-w-[32rem]"
      />
    </Modal>
  );
}

function Button({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <EnsureMatchNetworkButton className="h-10 w-full bg-primary text-xs font-bold text-white lg:w-40" {...rest}>
      {children}
    </EnsureMatchNetworkButton>
  );
}
