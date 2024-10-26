import { useState, useEffect } from "react";
import { MigrationStartModal } from "./start";
import { MigrationModal } from "./migration";
import { useChainId } from "wagmi";
import { ChainID } from "@/types";

const NETWORKS_REQUIRING_MIGRATION = [ChainID.CRAB, ChainID.KOI, ChainID.DARWINIA];

export function Migration() {
  const [modals, setModals] = useState({ start: false, migration: false });
  const chainId = useChainId();

  useEffect(() => {
    if (!chainId) return;

    if (NETWORKS_REQUIRING_MIGRATION.includes(chainId)) {
      setModals({ start: true, migration: false });
    }
  }, [chainId]);

  const handleNext = () => setModals({ start: false, migration: true });
  const handleClose = (modal: keyof typeof modals) => setModals((prev) => ({ ...prev, [modal]: false }));

  return (
    <>
      <MigrationStartModal isOpen={modals.start} onClose={() => handleClose("start")} onOk={handleNext} />
      <MigrationModal isOpen={modals.migration} onClose={() => handleClose("migration")} />
    </>
  );
}
