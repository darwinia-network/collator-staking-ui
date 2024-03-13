"use client";

import { useApp } from "@/hooks";
import { getChainConfig } from "@/utils";
import { useEffect, useRef } from "react";
import { notification } from "./notification";
import { useAccount, useSwitchChain } from "wagmi";

export default function WrongChainAlert() {
  const closerRef = useRef<(() => void) | null>(null);
  const { activeChain } = useApp();
  const account = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (account.chainId && account.chainId !== activeChain) {
      if (!closerRef.current) {
        const chainConfig = getChainConfig(activeChain);

        closerRef.current = notification.warn({
          duration: 0,
          description: (
            <p className="text-sm text-white">
              You are connected to the Wrong Chain.{" "}
              <span
                className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80"
                onClick={() => switchChain({ chainId: activeChain })}
              >{`Change the selected Chain to ${chainConfig.name}`}</span>{" "}
              in MetaMask.
            </p>
          ),
          onClose: () => {
            closerRef.current = null;
          },
        });
      }
    } else if (closerRef.current) {
      closerRef.current();
      closerRef.current = null;
    }
  }, [account.chainId, activeChain, switchChain]);

  return null;
}
