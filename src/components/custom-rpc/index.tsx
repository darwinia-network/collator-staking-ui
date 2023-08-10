"use client";

import {
  useFloating,
  offset,
  useTransitionStyles,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import Image from "next/image";
import { useState } from "react";
import RpcSelector from "./rpc-selector";

export default function CustomRpc() {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(10)],
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-20px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-20px)", opacity: 0 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <>
      <button
        className="inline-flex h-9 w-9 items-center justify-center border border-primary text-sm font-light text-white transition-opacity hover:opacity-80 active:opacity-60"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <Image width={16} height={16} alt="Custom rpc" src="/images/setting.svg" />
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles}>
              <RpcSelector onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
