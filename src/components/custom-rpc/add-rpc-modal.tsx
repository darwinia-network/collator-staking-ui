import { RpcMeta } from "@/types";
import { ChangeEventHandler, useState } from "react";
import Modal from "../modal";

export default function AddRpcModal({
  isOpen,
  onClose = () => undefined,
  onSave = () => undefined,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (rpcMeta: RpcMeta) => void;
}) {
  const [rpcMeta, setRpcMeta] = useState<RpcMeta>();

  return (
    <Modal title="Custom Endpoint" isOpen={isOpen} onClose={onClose} className="lg:w-[560px]">
      <div className="flex flex-col gap-5">
        <Input
          label="Endpoint Name (Optional)"
          onChange={(e) => setRpcMeta((prev) => ({ name: e.target.value, url: prev?.url || "" }))}
        />
        <Input
          label="Endpoint URL"
          onChange={(e) => setRpcMeta((prev) => ({ name: prev?.name, url: e.target.value }))}
        />

        <div className="h-[1px] w-full bg-white/20" />

        <button
          className="flex h-10 w-full items-center justify-center bg-primary transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            rpcMeta && onSave(rpcMeta);
          }}
          disabled={!rpcMeta?.url}
        >
          <span>Save</span>
        </button>
      </div>
    </Modal>
  );
}

function Input({ label, onChange }: { label: string; onChange: ChangeEventHandler<HTMLInputElement> }) {
  return (
    <div className="flex flex-col gap-middle">
      <span className="text-xs font-bold text-white">{label}</span>
      <input
        type="text"
        onChange={onChange}
        className="h-10 border border-white/50 bg-transparent px-2 text-sm transition-colors hover:border-white focus-visible:border-white focus-visible:outline-none"
      />
    </div>
  );
}
