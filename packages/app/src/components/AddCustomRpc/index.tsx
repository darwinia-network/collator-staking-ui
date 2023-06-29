import { useState } from "react";
import settingIcon from "../../assets/images/setting.svg";
import { RpcSelectorModal } from "./RpcSelectorModal";

export const CustomRpc = () => {
  const [isRpcSelectorModalVisible, setIsRpcSelectorModalVisible] = useState(false);

  return (
    <>
      <div
        className="border border-primary flex items-center justify-center h-9 w-9 hover:cursor-pointer"
        onClick={() => setIsRpcSelectorModalVisible(true)}
      >
        <img alt="..." src={settingIcon} />
      </div>

      <RpcSelectorModal isVisible={isRpcSelectorModalVisible} onClose={() => setIsRpcSelectorModalVisible(false)} />
    </>
  );
};
