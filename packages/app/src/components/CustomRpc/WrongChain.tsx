import { Popover } from "@darwinia/ui";
import { useMemo, useState } from "react";
import { useApp, useWallet } from "../../hooks";
import { getChainConfig } from "../../utils";
import closeIcon from "../../assets/images/close-white.svg";

export const WrongChain = () => {
  const [promptTrigger, setPromptTrigger] = useState<HTMLDivElement | null>(null);
  const { currentChain, switchNetwork } = useWallet();
  const { isWrongChainPromptOpen, setIsWrongChainPromptOpen } = useApp();

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) || null;
    }
    return null;
  }, [currentChain]);

  return (
    <>
      <div className="absolute bottom-0 right-0 h-[1px] w-[1px]" ref={setPromptTrigger} />
      <Popover
        offset={[0, 16]}
        triggerElementState={promptTrigger}
        triggerEvent="disabled"
        isOpen={isWrongChainPromptOpen}
      >
        <div className="flex flex-col gap-[10px] bg-blackSecondary p-5 border border-primary w-80 relative">
          <img
            width={16}
            height={16}
            alt="..."
            src={closeIcon}
            className="absolute top-2 right-2 hover:cursor-pointer"
            onClick={() => setIsWrongChainPromptOpen(false)}
          />
          <p className="text-14 text-white">
            You are connected to the Wrong Chain.{" "}
            <span
              className="text-primary transition-opacity hover:cursor-pointer hover:opacity-80"
              onClick={switchNetwork}
            >{`Change the selected Chain to ${chainConfig?.displayName}`}</span>{" "}
            in MetaMask.
          </p>
        </div>
      </Popover>
    </>
  );
};
