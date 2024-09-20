import { useState } from "react";
import { MigrationStartModal } from "./start";
import { MigrationModal } from "./migration";

export function Migration() {
  const [modals, setModals] = useState({ start: true, migration: false });

  const handleNext = () => setModals({ start: false, migration: true });
  const handleClose = (modal: keyof typeof modals) => setModals((prev) => ({ ...prev, [modal]: false }));

  return (
    <>
      <MigrationStartModal isOpen={modals.start} onClose={() => handleClose("start")} onOk={handleNext} />
      <MigrationModal isOpen={modals.migration} onClose={() => handleClose("migration")} />
    </>
  );
}
