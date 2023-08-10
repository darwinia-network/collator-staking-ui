import { useApp } from "@/hooks";
import { RpcMeta } from "@/types";
import { useState } from "react";
import AddRpcModal from "./add-rpc-modal";

export default function RpcSelector({ onClose = () => undefined }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { rpcMetas, setRpcMetas } = useApp();

  return (
    <>
      <div className="flex w-60 flex-col gap-middle border border-primary bg-component p-5">
        <div className="max-h-[25vh] overflow-y-auto">
          <div className="flex flex-col gap-middle">
            {rpcMetas.map((rpcMeta) => (
              <RpcItem key={rpcMeta.url} rpcMeta={rpcMeta} onClose={onClose} />
            ))}
          </div>
        </div>

        <div className="flex h-4 items-center gap-middle">
          <div className="h-[1px] w-full bg-white/20" />
          <span className="text-xs font-bold text-white">or</span>
          <div className="h-[1px] w-full bg-white/20" />
        </div>

        <button
          className="flex w-full items-center justify-center border border-primary bg-transparent py-2 transition-opacity hover:opacity-80 active:opacity-60"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-xs font-bold text-white">Add Custom Endpoint</span>
        </button>
      </div>

      <AddRpcModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(value) => {
          setRpcMetas((prev) => (prev.some(({ url }) => url === value.url) ? prev : [...prev, value]));
          setIsOpen(false);
        }}
      />
    </>
  );
}

function RpcItem({ rpcMeta, onClose }: { rpcMeta: RpcMeta; onClose: () => void }) {
  const { activeRpc, setActiveRpc } = useApp();

  return (
    <div
      className={`flex gap-middle p-small transition hover:cursor-pointer hover:opacity-80 active:opacity-60 ${
        activeRpc.url === rpcMeta.url ? "bg-primary/20" : "bg-white/20"
      }`}
      onClick={() => {
        setActiveRpc(rpcMeta);
        onClose();
      }}
    >
      <div
        className={`w-[3px] shrink-0 transition-colors ${activeRpc.url === rpcMeta.url ? "bg-primary" : "bg-white/20"}`}
      />
      <span className="break-all text-xs font-bold">via {rpcMeta.name ?? rpcMeta.url}</span>
    </div>
  );
}
