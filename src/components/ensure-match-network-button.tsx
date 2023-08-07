import { useApp } from "@/hooks";
import {
  ButtonHTMLAttributes,
  MouseEventHandler,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import OpacityButton from "./opacity-button";
import ScaleButton from "./scale-button";
import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";

export default forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "scale" | "opacity"; busy?: boolean }
>(function EnsureMatchNetworkButton({ children, onClick, kind = "opacity", disabled, busy, ...rest }, ref) {
  const { activeChain } = useApp();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const isMatch = useMemo(() => chain?.id === activeChain, [chain?.id, activeChain]);

  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false, enabled: !isMatch, handleClose: safePolygon() });
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  const { isMounted, styles } = useTransitionStyles(context, {
    initial: { transform: "scale(0.5)", opacity: 0 },
    open: { transform: "scale(1)", opacity: 1 },
    close: { transform: "scale(0.5)", opacity: 0 },
  });

  useImperativeHandle(ref, () => refs.reference.current as HTMLButtonElement, [refs]);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (isMatch && onClick) {
        return onClick(e);
      }
      return undefined;
    },
    [isMatch, onClick]
  );

  return (
    <>
      {kind === "opacity" ? (
        <OpacityButton
          data-disabled={!isMatch}
          ref={refs.setReference}
          onClick={handleClick}
          disabled={disabled || busy}
          busy={busy}
          {...rest}
          {...getReferenceProps()}
        >
          {children}
        </OpacityButton>
      ) : (
        <ScaleButton
          data-disabled={!isMatch}
          ref={refs.setReference}
          onClick={handleClick}
          disabled={disabled || busy}
          busy={busy}
          {...rest}
          {...getReferenceProps()}
        >
          {children}
        </ScaleButton>
      )}
      {isMounted && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-30">
            <FloatingArrow ref={arrowRef} style={styles} context={context} fill="#FF0083" />
            <div style={styles} className="w-[70vw] border border-primary bg-component  p-middle lg:w-64">
              <p className="text-xs font-light text-white">
                You are connected to the Wrong Chain.{" "}
                <span
                  className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80"
                  onClick={() => switchNetwork && switchNetwork(activeChain)}
                >
                  Switch network
                </span>
              </p>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
});
