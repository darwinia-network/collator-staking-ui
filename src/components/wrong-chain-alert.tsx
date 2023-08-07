"use client";

import { useApp } from "@/hooks";
import { getChainConfig } from "@/utils";
import { useEffect, useRef } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { notification } from "./notification";

export default function WrongChainAlert() {
  const closerRef = useRef<(() => void) | null>(null);
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const { activeChain } = useApp();

  useEffect(() => {
    if (chain?.id && chain.id !== activeChain) {
      if (!closerRef.current && switchNetwork) {
        const chainConfig = getChainConfig(activeChain);

        closerRef.current = notification.warn({
          duration: 0,
          description: (
            <p className="text-sm text-white">
              You are connected to the Wrong Chain.{" "}
              <span
                className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80"
                onClick={() => switchNetwork(activeChain)}
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
  }, [chain?.id, activeChain, switchNetwork]);

  return null;
}
