import { Modal } from "@darwinia/ui";
import { useEffect, useMemo, useState } from "react";
import { useAppTranslation } from "../../locale";
import { AddCustomRpcModal } from "./AddCustomRpcModal";
import type { RpcMeta } from "../../types";
import { useWallet } from "../../hooks";
import { getChainConfig } from "../../utils";

export const RpcSelectorModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useAppTranslation();
  const { currentChain, activeRpc, setActiveRpc } = useWallet();
  const [rpcs, setRpcs] = useState<RpcMeta[]>((currentChain && getChainConfig(currentChain)?.rpcMetas) || []);
  const [isAddCustomEndpointModalVisible, setIsAddCustomEndpointModalVisible] = useState(false);

  const supportedRpcs = useMemo(() => {
    if (rpcs.some(({ url }) => url === activeRpc.url)) {
      return [...rpcs];
    } else {
      return [...rpcs, activeRpc];
    }
  }, [rpcs, activeRpc]);

  useEffect(() => {
    setRpcs((currentChain && getChainConfig(currentChain)?.rpcMetas) || []);
  }, [currentChain]);

  return (
    <>
      <Modal isVisible={isVisible} onClose={onClose} className="w-[369px]">
        <div className="flex flex-col gap-5 bg-blackSecondary p-5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
          <div className="flex flex-col gap-[10px]">
            {supportedRpcs.map(({ name, url }) => (
              <div
                className="flex items-center gap-[10px] hover:cursor-pointer"
                key={url}
                onClick={() => {
                  setActiveRpc({ name, url });
                  onClose();
                }}
              >
                <MyCheckbox checked={activeRpc.url === url} />
                <span className="text-14 truncate">via {name ?? url}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[10px]">
            <button
              className="bg-primary h-8 flex items-center justify-center w-full"
              onClick={() => setIsAddCustomEndpointModalVisible(true)}
            >
              <span className="text-12-bold">{t("Add Custom Endpoint")}</span>
            </button>
          </div>
        </div>
      </Modal>

      <AddCustomRpcModal
        isVisible={isAddCustomEndpointModalVisible}
        onClose={() => setIsAddCustomEndpointModalVisible(false)}
        onSave={(value) => {
          setRpcs((prev) => [...prev, value]);
          setIsAddCustomEndpointModalVisible(false);
        }}
      />
    </>
  );
};

const MyCheckbox = ({ checked }: { checked: boolean }) => (
  <div className="border border-white w-3 h-3 flex justify-center items-center">
    <div className={`w-[6px] h-[6px] ${checked ? "bg-primary" : "bg-transparent"}`} />
  </div>
);
