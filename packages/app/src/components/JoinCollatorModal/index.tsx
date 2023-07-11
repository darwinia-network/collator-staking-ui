import { ChangeEvent, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Button, Input, ModalEnhanced, notification, Tooltip } from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "../../locale";
import { getChainConfig, isEthersApi, isValidNumber, isWalletClient, processTransactionError } from "../../utils";
import helpIcon from "../../assets/images/help.svg";
import { useWallet, useStaking, useApp } from "../../hooks";
import { BigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import { MetaMaskError } from "../../types";
import { Contract } from "ethers";
import { waitForTransaction, writeContract } from "@wagmi/core";

export interface JoinCollatorRefs {
  show: () => void;
}

export const JoinCollatorModal = forwardRef<JoinCollatorRefs>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [commission, setCommission] = useState<string>("");
  const [commissionHasError, setCommissionHasError] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string>("");
  const [sessionKeyHasError, setSessionKeyHasError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { t } = useAppTranslation();
  const { currentChain, signerApi, isNetworkMismatch } = useWallet();
  const {setIsWrongChainPromptOpen} = useApp()
  const { setCollatorSessionKey } = useStaking();

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const showModal = () => {
    setSessionKey("");
    setCommission("");
    setSessionKeyHasError(false);
    setCommissionHasError(false);
    setLoading(false);
    setIsVisible((oldStatus) => !oldStatus);
  };

  const onClose = () => {
    setIsVisible(false);
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
    if (isNetworkMismatch) {
      setIsWrongChainPromptOpen(true)
      return
    }
    
    if (!isValidNumber(commission)) {
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

    if (chainConfig && isEthersApi(signerApi)) {
      const stakingContract = new Contract(
        chainConfig.contractAddresses.staking,
        chainConfig.contractInterface.staking,
        signerApi.getSigner()
      );

      try {
        setLoading(true);
        const response = (await stakingContract.collect(BigNumber.from(commission))) as TransactionResponse;
        await response.wait(1);
        setLoading(false);
        setCommission("");
        notification.success({
          message: <div>{t(localeKeys.operationSuccessful)}</div>,
        });
      } catch (e) {
        const error = processTransactionError(e as MetaMaskError);
        setLoading(false);
        notification.error({
          message: <div>{error.message}</div>,
        });
        console.log(e);
      }
    } else if (chainConfig && isWalletClient(signerApi)) {
      setLoading(true);

      try {
        const { hash } = await writeContract({
          address: chainConfig.contractAddresses.staking,
          abi: chainConfig.contractInterface.staking,
          functionName: "collect",
          args: [BigNumber.from(commission).toBigInt()],
        });

        const receipt = await waitForTransaction({ hash });
        if (receipt.status === "success") {
          setLoading(false);
          setCommission("");
          notification.success({
            message: <div>{t(localeKeys.operationSuccessful)}</div>,
          });
        } else {
          setLoading(false);
          notification.error({
            message: <div>{receipt.status}</div>,
          });
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
        notification.error({
          message: <div>{(e as Error).message}</div>,
        });
      }
    }
  };

  const onSetSessionKey = async () => {
    try {
      if (sessionKey.trim().length === 0) {
        setSessionKeyHasError(true);
        notification.error({
          message: <div>{t(localeKeys.invalidSessionKey)}</div>,
        });
        return;
      }

      setLoading(true);
      const isSuccessful = await setCollatorSessionKey(sessionKey);
      setLoading(false);
      if (isSuccessful) {
        setSessionKey("");
        notification.error({
          message: <div>{t(localeKeys.operationSuccessful)}</div>,
        });
        return;
      }

      notification.error({
        message: <div>{t(localeKeys.sessionSettingUnsuccessful)}</div>,
      });
    } catch (e) {
      console.log(e);
      notification.error({
        message: <div>{t(localeKeys.sessionSettingUnsuccessful)}</div>,
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
      modalTitle={t(localeKeys.joinCollator)}
      isVisible={isVisible}
      isLoading={isLoading}
    >
      <div>
        <div className={"flex flex-col gap-[10px] py-[10px]"}>
          <div
            className={"text-halfWhite text-12 divider border-b pb-[10px]"}
            dangerouslySetInnerHTML={{
              __html: t(localeKeys.howToJoinCollator, {
                runNodeUrl: "https://docs.darwinia.network/how-to-become-a-collator-679e363b68ab47189bde7826c8258c1d",
                tutorialUrl: "https://docs.darwinia.network/how-to-become-a-collator-679e363b68ab47189bde7826c8258c1d",
              }),
            }}
          />
          <div className={"flex flex-col gap-[10px] divider border-b pb-[10px]"}>
            <div>{t(localeKeys.sessionKey)}</div>
            <Input
              value={sessionKey}
              onChange={onSessionKeyValueChange}
              hasErrorMessage={false}
              error={getSessionKeyErrorJSX()}
              leftIcon={null}
              placeholder={t(localeKeys.sessionKey)}
            />
            <Button disabled={sessionKey.length === 0} className={"capitalize"} onClick={onSetSessionKey}>
              {t(localeKeys.setSessionKey)}
            </Button>
          </div>

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
            <Button disabled={commission.length === 0} className={"capitalize"} onClick={onSetCommission}>
              {t(localeKeys.setCommission)}
            </Button>
          </div>
        </div>
      </div>
    </ModalEnhanced>
  );
});

JoinCollatorModal.displayName = "JoinCollator";
