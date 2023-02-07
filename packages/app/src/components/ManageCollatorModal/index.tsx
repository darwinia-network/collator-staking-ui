import { ChangeEvent, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button, Input, ModalEnhanced, notification, Tab, Tabs, Tooltip } from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { Collator } from "@darwinia/app-types";
import { isValidNumber } from "@darwinia/app-utils";
import helpIcon from "../../assets/images/help.svg";
import { useDispatch, useWallet } from "@darwinia/app-providers";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { TransactionResponse } from "@ethersproject/providers";

export interface ManageCollatorRefs {
  show: () => void;
}

const ManageCollatorModal = forwardRef<ManageCollatorRefs>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [commission, setCommission] = useState<string>("");
  const [commissionHasError, setCommissionHasError] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string>("");
  const [sessionKeyHasError, setSessionKeyHasError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const updatedCollator = useRef<Collator>();
  const { t } = useAppTranslation();
  const { stakingContract, provider } = useWallet();
  const { setCollatorSessionKey } = useDispatch();

  const tabs: Tab[] = [
    {
      id: "1",
      title: t(localeKeys.updateSessionKey),
    },
    {
      id: "2",
      title: t(localeKeys.updateCommission),
    },
    {
      id: "3",
      title: t(localeKeys.stopCollation),
    },
  ];

  const showModal = () => {
    setSessionKey("");
    setCommission("");
    setSessionKeyHasError(false);
    setCommissionHasError(false);
    setActiveTabId("1");
    setLoading(false);
    updatedCollator.current = undefined;
    setIsVisible((oldStatus) => !oldStatus);
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const onTabChange = (selectedTab: Tab) => {
    setCommissionHasError(false);
    setCommission("");
    setSessionKeyHasError(false);
    setSessionKey("");
    setActiveTabId(selectedTab.id);
  };

  const onCommissionValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCommissionHasError(false);
    setCommission(event.target.value);
  };

  const getCommissionErrorJSX = () => {
    return commissionHasError ? <div /> : null;
  };

  const onSessionKeyValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSessionKeyHasError(false);
    setSessionKey(event.target.value);
  };

  const getSessionKeyErrorJSX = () => {
    return sessionKeyHasError ? <div /> : null;
  };

  const onSetCommission = async () => {
    const isValidCommission = isValidNumber(commission);
    if (!isValidCommission) {
      notification.error({
        message: <div>{t(localeKeys.invalidCommission)}</div>,
      });
      setCommissionHasError(true);
      return;
    }

    const commissionAmount = Number(commission);
    if (commissionAmount < 0 || commissionAmount > 100) {
      setCommissionHasError(true);
      notification.error({
        message: <div>{t(localeKeys.commissionOutOfRange)}</div>,
      });
      return;
    }

    try {
      setLoading(true);
      const response = (await stakingContract?.collect(
        EthersBigNumber.from(commission.toString())
      )) as TransactionResponse;
      await response.wait(1);
      setLoading(false);
      setCommission("");
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setLoading(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
      console.log(e);
    }
  };

  const onSetSessionKey = async () => {
    if (sessionKey.trim().length === 0) {
      setSessionKeyHasError(true);
      notification.error({
        message: <div>{t(localeKeys.invalidSessionKey)}</div>,
      });
      return;
    }
    setLoading(true);
    const isSuccessful = await setCollatorSessionKey(sessionKey, provider);
    setLoading(false);
    if (isSuccessful) {
      setSessionKey("");
      notification.error({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
      return;
    }

    notification.error({
      message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
    });
  };

  const onStopCollating = async () => {
    try {
      setLoading(true);
      const response = (await stakingContract?.chill()) as TransactionResponse;
      await response.wait(1);
      setLoading(false);
      onClose();
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setLoading(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
      });
    }
  };

  useImperativeHandle(ref, () => {
    return {
      show: showModal,
    };
  });

  return (
    <ModalEnhanced
      className={"!max-w-[790px]"}
      contentClassName={"h-[400px]"}
      onClose={onClose}
      modalTitle={t(localeKeys.manageCollator)}
      isVisible={isVisible}
      isLoading={isLoading}
    >
      <div>
        <Tabs onChange={onTabChange} tabs={tabs} activeTabId={activeTabId} />
        {/*Tabs content*/}
        {activeTabId === "1" && (
          <div>
            <div className={"flex flex-col gap-[10px] py-[10px]"}>
              <div className={"flex flex-col gap-[10px]"}>
                <div>{t(localeKeys.sessionKey)}</div>
                <Input
                  value={sessionKey}
                  onChange={onSessionKeyValueChange}
                  hasErrorMessage={false}
                  error={getSessionKeyErrorJSX()}
                  leftIcon={null}
                  placeholder={t(localeKeys.sessionKey)}
                />
                <Button
                  disabled={sessionKey.length === 0}
                  className={"capitalize !min-w-[150px]"}
                  onClick={onSetSessionKey}
                >
                  {t(localeKeys.update)}
                </Button>
              </div>
            </div>
          </div>
        )}
        {activeTabId === "2" && (
          <div>
            <div className={"flex flex-col gap-[10px] py-[10px]"}>
              <div className={"flex flex-col gap-[10px]"}>
                <div className={"flex items-center gap-[10px]"}>
                  {t(localeKeys.commission)} (%){" "}
                  <Tooltip message={t(localeKeys.commissionPercentInfo)}>
                    <img className={"w-[16px]"} src={helpIcon} alt="image" />
                  </Tooltip>
                </div>
                <Input
                  value={commission}
                  onChange={onCommissionValueChange}
                  hasErrorMessage={false}
                  error={getCommissionErrorJSX()}
                  leftIcon={null}
                  placeholder={t(localeKeys.commission)}
                  rightSlot={<div className={"flex items-center px-[10px] text-white"}>%</div>}
                />
                <Button
                  disabled={commission.length === 0}
                  className={"capitalize min-w-[150px]"}
                  onClick={onSetCommission}
                >
                  {t(localeKeys.update)}
                </Button>
              </div>
            </div>
          </div>
        )}
        {activeTabId === "3" && (
          <div>
            <div className={"flex flex-col gap-[10px] py-[10px]"}>
              <div
                className={"text-halfWhite text-12 divider border-b pb-[10px]"}
                dangerouslySetInnerHTML={{
                  __html: t(localeKeys.stopCollatingInfo),
                }}
              />
              <Button className={"capitalize min-w-[150px]"} onClick={onStopCollating}>
                {t(localeKeys.stopCollation)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalEnhanced>
  );
});

ManageCollatorModal.displayName = "ManageCollator";

export default ManageCollatorModal;
