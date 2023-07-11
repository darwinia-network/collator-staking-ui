import { useEffect, useState } from "react";
import settingIcon from "../../assets/images/setting.svg";
import { RpcSelector } from "./RpcSelector";
import { Popover } from "@darwinia/ui";
import { useWallet } from "../../hooks";
import { getChainConfig } from "../../utils";
import { RpcMeta } from "../../types";
import { WrongChain } from "./WrongChain";

export const CustomRpc = () => {
  const [rpcSelectorTrigger, setRpcSelectorTrigger] = useState<HTMLDivElement | null>(null);
  const [rpcs, setRpcs] = useState<RpcMeta[]>([]);
  const { currentChain } = useWallet();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.href.split("?").at(1));
    const rpcParam = searchParams.get("rpc");

    if (currentChain) {
      const chainConfig = getChainConfig(currentChain);
      const rpcParamUrl = rpcParam ? decodeURIComponent(rpcParam) : null;
      if (chainConfig?.rpcMetas.some(({ url }) => url === rpcParamUrl)) {
        setRpcs(chainConfig.rpcMetas);
      } else {
        setRpcs((chainConfig?.rpcMetas ?? []).concat(rpcParamUrl ? { url: rpcParamUrl } : []));
      }
    }
  }, [currentChain]);

  return (
    <>
      <div className="relative">
        <WrongChain />
        <div
          ref={setRpcSelectorTrigger}
          className="border border-primary flex items-center justify-center h-9 w-9 hover:cursor-pointer"
        >
          <img alt="..." src={settingIcon} />
        </div>
      </div>

      <Popover offset={[0, 16]} triggerElementState={rpcSelectorTrigger} triggerEvent="click">
        <RpcSelector rpcs={rpcs} setRpcs={setRpcs} />
      </Popover>
    </>
  );
};
