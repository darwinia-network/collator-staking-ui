import Modal from "./modal";
import CollatorInput from "./collator-input";
import { useCallback, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useApp, useStaking } from "@/hooks";
import { notification } from "./notification";
import { ChainID } from "@/types";
import { clientBuilder } from "@/libs";
import { getChainConfig, notifyTransaction } from "@/utils";

export default function JoinCollatorModal({
  isOpen,
  onClose = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { activeChain } = useApp();
  const { isCollatorCommissionLoading, updateCollatorCommission } = useStaking();

  const [sessionKey, setSessionKey] = useState("");
  const [commission, setCommission] = useState("");
  const [busy, setBusy] = useState(false);

  const handleJoin = useCallback(async () => {
    const commissionValue = Number(commission);

    if (Number.isNaN(commissionValue) || commissionValue < 0 || 100 < commissionValue) {
      notification.error({ description: "Invalid commission, please enter 0~100." });
    } else if (walletClient) {
      const { explorer } = getChainConfig(activeChain);
      setBusy(true);

      try {
        const client =
          activeChain === ChainID.CRAB
            ? clientBuilder.buildCrabClient(publicClient)
            : clientBuilder.buildDarwiniaClient(publicClient);

        // we appended 00 to the session key to represent that we don't need any proof. Originally the setKeys method
        // required two params which are session key and proof but here we append both values into one param
        const proof = `${sessionKey}00` as `0x${string}`;
        const sessionKeyCall = client.calls.session.buildSetKeysCallH(proof);
        const commissionCall = client.calls.darwiniaStaking.buildCollectCall(commission);
        const receipt = await client.calls.utility.batchAll(walletClient, [sessionKeyCall, commissionCall]);

        if (receipt.status === "success") {
          updateCollatorCommission();
          setSessionKey("");
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
  }, [activeChain, sessionKey, commission, publicClient, walletClient, updateCollatorCommission, onClose]);

  return (
    <Modal
      title="Join Collator"
      isOpen={isOpen}
      onClose={onClose}
      onOk={handleJoin}
      okText="Join"
      maskClosable={false}
      className="lg:h-[25rem] lg:w-[45rem]"
      btnWrapClassName="lg:flex-row"
      btnClassName="lg:w-40"
      disabled={!sessionKey || !commission}
      busy={busy || isCollatorCommissionLoading}
    >
      <p className="text-xs font-light text-white/90">
        Note that you need to complete two steps in sequence, setup [Session Key] and setup [Commission] before becoming
        a collator. Please{" "}
        <a
          className="text-primary transition-all hover:underline"
          target="_blank"
          rel="noopener"
          href="https://docs.darwinia.network/run-collator-node-af6bce360d5b49ddacc56e4587510210"
        >
          Run A Node
        </a>{" "}
        first and get the session key of your running node.{" "}
        <a
          className="text-primary transition-all hover:underline"
          target="_blank"
          rel="noopener"
          href="https://docs.darwinia.network/run-collator-node-af6bce360d5b49ddacc56e4587510210"
        >
          Tutorial
        </a>
      </p>
      <div className="h-[1px] bg-white/20" />

      <CollatorInput label="Session Key" placeholder="Session key" onChange={setSessionKey} />
      <CollatorInput
        label="Commission (%)"
        placeholder="Commission"
        suffix="%"
        tooltip="The percent a collator takes off the top of the due staking rewards."
        onChange={setCommission}
      />
    </Modal>
  );
}
