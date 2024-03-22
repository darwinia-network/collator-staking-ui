"use client";

import { useApp } from "@/hooks";
import { getChainConfig, getChainConfigs } from "@/utils";
import {
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

const chainOptions = getChainConfigs();

export default function ChainSwitch() {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { setActiveChain } = useApp();
  const [currentChain, setCurrentChain] = useState(chainOptions.find((option) => option.chainId === chain?.id));
  useEffect(() => {
    const c = chainOptions.find((option) => option.chainId === chain?.id);
    setCurrentChain(c);
    c && setActiveChain(c.chainId);
  }, [chain?.id, setActiveChain]);

  const [isOpen, setIsOpen] = useState(false);
  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
        },
      }),
    ],
  });
  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return chain ? (
    <>
      <button
        className={`flex h-10 items-center justify-center gap-middle border border-primary px-large transition-opacity hover:opacity-80 lg:h-9 ${
          currentChain ? "border-primary" : "border-orange-400"
        }`}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {currentChain ? (
          <>
            <Image alt="Chain logo" width={24} height={24} src={getChainLogo(currentChain.logo)} />
            <span className="text-sm font-light">{currentChain.name}</span>
            <Image
              src="/images/caret-down.svg"
              alt="Account profiles icon"
              width={16}
              height={16}
              className="transition-transform duration-300"
              style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
            />
          </>
        ) : (
          <div className="flex items-center gap-middle">
            <Image src="/images/status/warn.svg" alt="Account profiles icon" width={20} height={20} />
            <span className="text-sm font-light text-orange-300">Wrong Chain</span>
          </div>
        )}
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className="flex flex-col gap-[2px] border border-primary bg-app-black">
              {chainOptions.map((option) => (
                <button
                  key={option.chainId}
                  className={`flex items-center gap-middle p-middle transition-colors ${
                    option.chainId === chain?.id ? "bg-white/10" : "hover:bg-white/10"
                  }`}
                  disabled={option.chainId === chain?.id}
                  onClick={() => {
                    switchNetwork?.(option.chainId);
                    setIsOpen(false);
                  }}
                >
                  <Image alt="Chain logo" width={24} height={24} src={getChainLogo(option.logo)} />
                  <span className="text-sm font-light">{getChainConfig(option.chainId).name}</span>
                </button>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  ) : null;
}

function getChainLogo(fileName: string) {
  return `/images/chain/${fileName}`;
}
