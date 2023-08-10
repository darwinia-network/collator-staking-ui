"use client";

import { Dispatch, PropsWithChildren, ReactElement, SetStateAction, forwardRef, ButtonHTMLAttributes } from "react";
import {
  useClick,
  useFloating,
  useInteractions,
  useTransitionStyles,
  offset,
  size,
  useDismiss,
  FloatingPortal,
} from "@floating-ui/react";
import Image from "next/image";

interface Props {
  label: ReactElement;
  labelClassName?: string;
  menuClassName?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Selector({
  label,
  labelClassName,
  menuClassName,
  children,
  isOpen,
  setIsOpen,
}: PropsWithChildren<Props>) {
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

  return (
    <>
      <Button
        className={`flex min-w-[126px] items-center justify-between gap-middle ${labelClassName}`}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {label}
        <Image
          src="/images/caret-down.svg"
          alt="Account profiles icon"
          width={16}
          height={16}
          className="translate-y-3 transition-transform duration-300"
          style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
        />
      </Button>
      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div style={styles} className={menuClassName}>
              {children}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { children, className, ...rest },
  ref
) {
  return (
    <button
      {...rest}
      type="button"
      ref={ref}
      className={`flex h-10 items-center border border-primary px-large text-sm font-light text-white transition-opacity hover:opacity-80 active:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
});
