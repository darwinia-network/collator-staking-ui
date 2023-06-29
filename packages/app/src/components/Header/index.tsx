import { Link, useLocation } from "react-router-dom";
import logoIcon from "../../assets/images/logo.png";
import caretIcon from "../../assets/images/caret-down.svg";
import { useMemo, useRef, useState } from "react";
import { Button, Popover } from "@darwinia/ui";
import { useAppTranslation, localeKeys } from "../../locale";
import { useStaking, useWallet } from "../../hooks";
import { getChainConfig, getChainsConfig, toShortAddress } from "../../utils";
import JazzIcon from "../JazzIcon";
import { utils } from "ethers";
import { JoinCollatorModal, JoinCollatorRefs } from "../JoinCollatorModal";
import { ManageCollatorModal, ManageCollatorRefs } from "../ManageCollatorModal";
import { CustomRpc } from "../AddCustomRpc";

export const Header = () => {
  const [networkOptionsTrigger, setNetworkOptionsTrigger] = useState<HTMLDivElement | null>(null);
  const { t } = useAppTranslation();
  const { currentChain, activeAccount, setCurrentChain, connect, disconnect } = useWallet();
  const location = useLocation();
  const joinCollatorModalRef = useRef<JoinCollatorRefs>(null);
  const [moreOptionsTrigger, setMoreOptionsTrigger] = useState<HTMLDivElement | null>(null);
  const [moreOptionsTriggerMobile, setMoreOptionsTriggerMobile] = useState<HTMLDivElement | null>(null);
  const manageCollatorModalRef = useRef<ManageCollatorRefs>(null);
  const { collators } = useStaking();

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const isUserACollator = () => {
    return collators?.some(
      (collator) => collator.accountAddress.toLowerCase() === activeAccount?.address.toLowerCase()
    );
  };

  const accountOptions = () => {
    const joinCollatorClass = isUserACollator() ? "text-halfWhite cursor-no-drop" : "cursor-pointer clickable";
    const manageCollatorClass = isUserACollator() ? "cursor-pointer clickable" : "text-halfWhite cursor-no-drop";
    return (
      <div className={"border bg-black flex flex-col gap-[10px] border-primary p-[20px] select-none"}>
        <div
          onClick={() => {
            if (!isUserACollator()) {
              document.body.click();
              joinCollatorModalRef.current?.show();
            }
          }}
          className={`capitalize ${joinCollatorClass}`}
        >
          {t(localeKeys.joinCollator)}
        </div>
        <div
          onClick={() => {
            if (isUserACollator()) {
              document.body.click();
              manageCollatorModalRef.current?.show();
            }
          }}
          className={`capitalize ${manageCollatorClass}`}
        >
          {t(localeKeys.manageCollator)}
        </div>
        <div className="capitalize clickable" onClick={disconnect}>
          {t("disconnect")}
        </div>
      </div>
    );
  };

  return (
    <div className={`shrink-0 h-[66px] lg:h-[60px] w-full fixed top-0 left-0 right-0 z-[30] bg-black`}>
      <div className={"justify-center flex h-full wrapper-padding"}>
        <div className={"app-container w-full"}>
          <div className={"flex flex-1 h-full shrink-0 items-center justify-between"}>
            {/*Logo*/}
            {/*Logo will only show on the PC*/}
            <div className={"shrink-0 h-full hidden lg:flex"}>
              <Link className={"h-full flex"} to={location.pathname}>
                <img className={"self-center w-[146px]"} src={logoIcon} alt="image" />
              </Link>
            </div>
            {/*This connect wallet button / selected account info will only be shown on mobile phones*/}
            <div className={"shrink-0 h-full flex items-center lg:hidden"}>
              {activeAccount ? (
                <div className={"border-primary border pl-[15px]"}>
                  <div className={"flex items-center gap-[10px]"}>
                    <JazzIcon size={20} address={utils.getAddress(activeAccount.address)} />
                    <div ref={setMoreOptionsTriggerMobile} className={"select-none pr-[15px] py-[7px] flex gap-[10px]"}>
                      <div>{toShortAddress(utils.getAddress(activeAccount.address))}</div>
                      <img className={"w-[16px]"} src={caretIcon} alt="image" />
                    </div>
                    <Popover offset={[0, 5]} triggerElementState={moreOptionsTriggerMobile} triggerEvent={"click"}>
                      <div>{accountOptions()}</div>
                    </Popover>
                  </div>
                </div>
              ) : (
                <Button disabled className={"!px-[15px]"} btnType={"secondary"}>
                  {t(localeKeys.connectWallet)}
                </Button>
              )}
            </div>
            {/*PC network switch and wallet connection*/}
            <div className={"hidden lg:flex items-center gap-[40px]"}>
              <div className={"pc-network-selector flex items-center  gap-[40px]"}>
                {getChainsConfig().map((network) => {
                  const activeNetworkClass = network.chainId === currentChain ? `after:block` : `after:hidden`;
                  return (
                    <div
                      onClick={() => {
                        setCurrentChain(network.chainId);
                      }}
                      className={`cursor-pointer relative h-[36px] flex items-center after:absolute after:left-0 after:right-0 after:h-[2px] after:bottom-0 after:bg-primary ${activeNetworkClass}`}
                      key={`${network.name}-${network.displayName}`}
                    >
                      {network.displayName}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center items-center gap-[10px]">
                {activeAccount ? (
                  <div className={"border-primary border pl-[15px]"}>
                    <div className={"flex items-center gap-[10px]"}>
                      <JazzIcon size={20} address={utils.getAddress(activeAccount.address)} />
                      <div
                        ref={setMoreOptionsTrigger}
                        className={"select-none cursor-pointer pr-[15px] py-[5px] flex gap-[10px]"}
                      >
                        <div>{toShortAddress(utils.getAddress(activeAccount.address))}</div>
                        <img className={"w-[16px]"} src={caretIcon} alt="image" />
                      </div>
                      <Popover offset={[0, 5]} triggerElementState={moreOptionsTrigger} triggerEvent={"click"}>
                        <div>{accountOptions()}</div>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <div className="h-9 flex justify-center items-center hover:cursor-pointer border border-primary px-3" onClick={() => connect("wallet-connect")}>
                    <span>{t(localeKeys.connectWallet)}</span>
                  </div>
                )}
                <CustomRpc />
              </div>
            </div>
            {/*network switch toggle*/}
            <div
              ref={setNetworkOptionsTrigger}
              className={"shrink-0 h-full items-center flex pr-[0.625rem] pl-[1.2rem] lg:hidden"}
            >
              <div className={"border-primary border px-[15px] py-[7px]"}>
                <div className={"flex items-center gap-[10px]"}>
                  <div>{chainConfig?.displayName}</div>
                  <img src={caretIcon} alt="image" />
                </div>
              </div>
            </div>
            <Popover offset={[-10, -7]} triggerElementState={networkOptionsTrigger} triggerEvent={"click"}>
              <div className={"border border-primary p-[15px] flex flex-col gap-[15px] bg-black"}>
                {getChainsConfig().map((network) => {
                  return (
                    <div
                      onClick={() => {
                        setCurrentChain(network.chainId);
                      }}
                      key={`${network.name}-${network.displayName}`}
                    >
                      {network.displayName}
                    </div>
                  );
                })}
              </div>
            </Popover>
          </div>
        </div>
      </div>
      <JoinCollatorModal ref={joinCollatorModalRef} />
      <ManageCollatorModal ref={manageCollatorModalRef} />
    </div>
  );
};
