import { Dispatch, SetStateAction, useState } from "react";
import { useAppTranslation } from "../../locale";
import { AddCustomRpcModal } from "./AddCustomRpcModal";
import type { RpcMeta } from "../../types";
import { useApp, useWallet } from "../../hooks";

export const RpcSelector = ({rpcs, setRpcs}:{
  rpcs: RpcMeta[];
  setRpcs: Dispatch<SetStateAction<RpcMeta[]>>;
}) => {
  const { t } = useAppTranslation();
  const { activeRpc, setActiveRpc } = useWallet();
  const [isAddCustomEndpointModalVisible, setIsAddCustomEndpointModalVisible] = useState(false);

  return (
    <>
      <div
        className="flex flex-col gap-[10px] bg-blackSecondary p-5 overflow-y-auto border border-primary w-60"
        style={{ maxHeight: "80vh" }}
      >
        <>
          {rpcs.map((rpcMeta) => (
            <RpcItem key={rpcMeta.url} activeRpc={activeRpc} rpcMeta={rpcMeta} onSelect={setActiveRpc} />
          ))}
        </>

        <div className="h-4 flex items-center gap-[10px]">
          <div className="bg-white/20 w-full h-[1px]" />
          <span className="text-12-bold">or</span>
          <div className="bg-white/20 w-full h-[1px]" />
        </div>

        <button
          className="bg-transparent border border-primary py-2 flex items-center justify-center w-full"
          onClick={() => setIsAddCustomEndpointModalVisible(true)}
        >
          <span className="text-12-bold">{t("Add Custom Endpoint")}</span>
        </button>
      </div>

      <AddCustomRpcModal
        isVisible={isAddCustomEndpointModalVisible}
        onClose={() => setIsAddCustomEndpointModalVisible(false)}
        onSave={(value) => {
          setRpcs((prev) => (prev.some(({ url }) => url === value.url) ? prev : [...prev, value]));
        }}
      />
    </>
  );
};

function RpcItem({
  activeRpc,
  rpcMeta,
  onSelect,
}: {
  activeRpc: RpcMeta;
  rpcMeta: RpcMeta;
  onSelect: (rpcMeta: RpcMeta) => void;
}) {
  const {isNetworkMismatch} = useWallet();
  const {setIsWrongChainPromptOpen} = useApp()
  return (
    <div
      className={`p-[5px] flex gap-[10px] hover:cursor-pointer ${
        activeRpc.url === rpcMeta.url ? "bg-primary/20" : "bg-white/20"
      }`}
      onClick={() => {
        if (isNetworkMismatch) {
          setIsWrongChainPromptOpen(true);
        } else {
          onSelect(rpcMeta);
          document.body.click();
        }
      }}
    >
      <div className={`px-[3px] ${activeRpc.url === rpcMeta.url ? "bg-primary" : "bg-white/20"}`} />
      <span className="text-12-bold break-all">via {rpcMeta.name ?? rpcMeta.url}</span>
    </div>
  );
}
