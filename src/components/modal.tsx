import Image from "next/image";
import { PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import EnsureMatchNetworkButton from "./ensure-match-network-button";

interface Props {
  isOpen: boolean;
  title: string;
  cancelText?: string;
  okText?: string;
  disabled?: boolean;
  busy?: boolean;
  maskClosable?: boolean;
  className?: string;
  btnWrapClassName?: string;
  btnClassName?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}

export default function Modal({
  isOpen,
  title,
  children,
  cancelText,
  okText,
  disabled,
  busy,
  className,
  btnClassName,
  btnWrapClassName,
  maskClosable = true,
  onClose = () => undefined,
  onCancel,
  onOk,
}: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      nodeRef={nodeRef}
      classNames="modal-fade"
      unmountOnExit
      onEnter={() => {
        document.body.style.overflow = "hidden";
      }}
      onExited={() => {
        document.body.style.overflow = "auto";
      }}
    >
      <div
        ref={nodeRef}
        className="fixed left-0 top-0 z-30 flex h-screen w-screen items-center justify-center bg-app-black/80 px-large"
        onClick={() => {
          if (maskClosable) {
            onClose();
          }
        }}
      >
        <div className={`flex w-full flex-col border border-primary ${className}`} onClick={(e) => e.stopPropagation()}>
          {/* header */}
          <div className="flex h-11 items-center justify-between bg-primary px-middle">
            <span className="text-sm font-bold text-white">{title}</span>
            <Image
              alt="Close modal"
              width={24}
              height={24}
              src="/images/close-white.svg"
              className="transition-transform hover:scale-105 hover:cursor-pointer active:scale-95"
              onClick={onClose}
            />
          </div>
          {/* content */}
          <div className={`h-full bg-component p-large ${onCancel || onOk ? "flex flex-col gap-large" : ""}`}>
            {children}{" "}
            {(onCancel || onOk) && (
              <>
                <div className="h-[1px] bg-white/20" />

                {(onOk || onCancel) && (
                  <div className={`flex flex-col gap-large ${btnWrapClassName}`}>
                    {onOk && (
                      <EnsureMatchNetworkButton
                        className={`h-10 shrink-0 border border-primary bg-primary text-sm font-bold text-white ${btnClassName}`}
                        onClick={onOk}
                        disabled={disabled}
                        busy={busy}
                      >{`${okText || "Ok"}`}</EnsureMatchNetworkButton>
                    )}
                    {onCancel && (
                      <button
                        className={`h-10 shrink-0 border border-primary bg-transparent text-sm font-bold text-white transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 ${btnClassName}`}
                        onClick={onCancel}
                      >{`${cancelText || "Cancel"}`}</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CSSTransition>,
    document.body
  );
}
