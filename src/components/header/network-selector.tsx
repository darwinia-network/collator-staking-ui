"use client";

import { useApp } from "@/hooks";
import Selector from "../selector";
import { getChainConfig, getChainConfigs } from "@/utils";
import { useState } from "react";
import ActionButton from "./action-button";

const chainConfigs = getChainConfigs();

export default function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeChain, setActiveChain } = useApp();

  const chainConfig = getChainConfig(activeChain);

  return (
    <>
      {/* mobile */}
      <div className="lg:hidden">
        <Selector
          label={<span className="text-sm font-light">{chainConfig.name}</span>}
          menuClassName="border border-primary p-large flex flex-col items-start gap-large bg-app-black"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          {chainConfigs.map(({ name, chainId }) => (
            <ActionButton
              key={chainId}
              disabled={chainId === activeChain}
              onClick={() => {
                setActiveChain(chainId);
                setIsOpen(false);
              }}
            >
              {name}
            </ActionButton>
          ))}
        </Selector>
      </div>

      {/* pc */}
      <div className="hidden lg:block">
        <div className="relative flex items-center gap-10">
          {chainConfigs.map(({ name, chainId }) => (
            <button
              key={chainId}
              onClick={() => setActiveChain(chainId)}
              className={`border-b-[2px] pb-1 transition duration-300 hover:opacity-80 ${
                chainId === activeChain ? "border-b-primary" : "border-b-transparent"
              }`}
            >
              <span
                className={`text-sm text-white transition-all ${chainId === activeChain ? "font-bold" : "font-light"}`}
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
