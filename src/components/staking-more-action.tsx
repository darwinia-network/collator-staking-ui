import {
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { useState } from "react";
import RecordsActionButton from "./records-action-button";
import UndelegateModal from "./undelegate-modal";

export default function StakingMoreAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <RecordsActionButton ref={refs.setReference} {...getReferenceProps()}>
        ...
      </RecordsActionButton>
      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-10">
            <div style={styles}>
              <RecordsActionButton onClick={() => setIsModalOpen(true)}>Undelegate</RecordsActionButton>
            </div>
          </div>
        </FloatingPortal>
      )}

      <UndelegateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
