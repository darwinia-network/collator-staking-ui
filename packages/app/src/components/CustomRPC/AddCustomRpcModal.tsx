import { ModalEnhanced } from "@darwinia/ui";
import { useAppTranslation } from "../../locale";
import { ChangeEventHandler, useState } from "react";
import type { RpcMeta } from "../../types";

export const AddCustomRpcModal = ({
  isVisible,
  onClose: _onClose,
  onSave,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSave: (rpcMeta: RpcMeta) => void;
}) => {
  const { t } = useAppTranslation();
  const [rpcMeta, setRpcMeta] = useState<RpcMeta>();

  const onClose = () => {
    setRpcMeta(undefined);
    _onClose();
  };

  return (
    <ModalEnhanced isVisible={isVisible} className="w-[560px]" modalTitle={t("Custom Endpoint")} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <MyInput
          label={t("Endpoint Name (Optional)")}
          onChange={(e) => setRpcMeta((prev) => ({ name: e.target.value, url: prev?.url || "" }))}
        />
        <MyInput
          label={t("Endpoint URL")}
          onChange={(e) => setRpcMeta((prev) => ({ name: prev?.name, url: e.target.value }))}
        />
        <div className="w-full h-[1px] bg-black/20" />
        <button
          className={`bg-primary w-full flex justify-center items-center h-10 ${
            rpcMeta?.url ? "" : "cursor-not-allowed opacity-80"
          }`}
          onClick={() => rpcMeta && onSave(rpcMeta)}
          disabled={!rpcMeta?.url}
        >
          <span>{t("Save")}</span>
        </button>
      </div>
    </ModalEnhanced>
  );
};

const MyInput = ({ label, onChange }: { label: string; onChange: ChangeEventHandler<HTMLInputElement> }) => (
  <div className="flex flex-col gap-[10px]">
    <span className="text-white text-12-bold">{label}</span>
    <input type="text" onChange={onChange} className="h-10 text-black px-2" />
  </div>
);
