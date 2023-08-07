"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { toShortAdrress } from "@/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Selector, { Button } from "../selector";
import ActionButton from "./action-button";
import Jazzicon from "../jazzicon";
import JoinCollatorModal from "../join-collator-modal";
import ManageCollator from "../manage-collator-modal";
import { useStaking } from "@/hooks";

export default function User() {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isJoinCollatorModalOpen, setIsJoinCollatorModalOpen] = useState(false);
  const [isManageCollatorModalOpen, setIsManageCollatorModalOpen] = useState(false);

  const { collatorCommission } = useStaking();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const isCollator = address && collatorCommission[address] ? true : false;

  return address ? (
    <>
      <Selector
        menuClassName="border border-primary p-large flex flex-col items-start gap-large bg-app-black"
        label={
          <>
            <Jazzicon size={24} address={address} />
            <span className="text-sm font-light uppercase">{toShortAdrress(address)}</span>
          </>
        }
        labelClassName="lg:h-9"
        isOpen={isSelectorOpen}
        setIsOpen={setIsSelectorOpen}
      >
        <ActionButton
          onClick={() => {
            setIsSelectorOpen(false);
            setIsJoinCollatorModalOpen(true);
          }}
          disabled={isCollator}
        >
          Join Collator
        </ActionButton>
        <ActionButton
          onClick={() => {
            setIsSelectorOpen(false);
            setIsManageCollatorModalOpen(true);
          }}
          disabled={!isCollator}
        >
          Manage Collator
        </ActionButton>
        <ActionButton
          onClick={() => {
            setIsSelectorOpen(false);
            disconnect();
          }}
        >
          Disconnect
        </ActionButton>
      </Selector>

      <JoinCollatorModal isOpen={isJoinCollatorModalOpen} onClose={() => setIsJoinCollatorModalOpen(false)} />
      <ManageCollator isOpen={isManageCollatorModalOpen} onClose={() => setIsManageCollatorModalOpen(false)} />
    </>
  ) : (
    <Button className="capitalize lg:h-9" onClick={() => openConnectModal && openConnectModal()}>
      Connect Wallet
    </Button>
  );
}
