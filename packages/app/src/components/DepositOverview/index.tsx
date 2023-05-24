import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { localeKeys, useAppTranslation } from "../../locale";
import { Button, Input, OptionProps, Select, notification, Tooltip } from "@darwinia/ui";
import ringIcon from "../../assets/images/ring.svg";
import crabIcon from "../../assets/images/crab.svg";
import { useStaking, useWallet } from "../../hooks";
import {
  calcKtonFromRingDeposit,
  getChainConfig,
  isEthersApi,
  isValidNumber,
  parseBalance,
  processTransactionError,
} from "../../utils";
import { DepositRecords } from "../DepositRecords";
import { BigNumber, Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";
import { ChainID, MetaMaskError } from "../../types";
import { formatBalance } from "../../utils";
import { BN_ZERO } from "../../config";

export const DepositOverview = () => {
  const { t } = useAppTranslation();
  const { currentChain, signerApi } = useWallet();
  const { minimumDepositAmount, balance } = useStaking();
  const [depositTerm, setDepositTerm] = useState<string>("1");
  const [amount, setAmount] = useState<string>("");
  const [amountHasError, setAmountHasError] = useState<boolean>(false);
  const [rewardedKTON, setRewardedKTON] = useState(BN_ZERO);

  const chainConfig = useMemo(() => {
    if (currentChain) {
      return getChainConfig(currentChain) ?? null;
    }
    return null;
  }, [currentChain]);

  const ringTokenIcon = chainConfig?.chainId === ChainID.CRAB ? crabIcon : ringIcon;

  useEffect(() => {
    setDepositTerm("1");
    setAmount("");
    setAmountHasError(false);
  }, []);

  const getDepositTerms = () => {
    const terms: OptionProps[] = [];
    /*Create 36 deposit terms*/
    for (let i = 1; i <= 36; i++) {
      let label: JSX.Element | null = null;
      /*Useless for now, but maybe useful in the future if the deposit term starts at zero*/
      if (i === 0) {
        label = <div className={"capitalize"}>{t(localeKeys.noFixedTerm)}</div>;
      } else if (i === 1) {
        label = <div className={"capitalize"}>{t(localeKeys.month, { number: i })}</div>;
      } else {
        label = <div className={"capitalize"}>{t(localeKeys.months, { number: i })}</div>;
      }

      terms.push({
        id: `${i}`,
        value: `${i}`,
        label,
      });
    }
    return terms;
  };

  const getAmountErrorJSX = () => {
    return amountHasError ? <div /> : null;
  };

  useEffect(() => {
    if (isValidNumber(amount) && isValidNumber(depositTerm)) {
      setRewardedKTON(calcKtonFromRingDeposit(BigNumber.from(amount), Number(depositTerm)));
    } else {
      setRewardedKTON(BN_ZERO);
    }
  }, [depositTerm, amount]);

  const onDepositTermChanged = (value: string) => {
    setDepositTerm(value);
  };

  const onAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmountHasError(false);
    setAmount(event.target.value);
  };

  const onDeposit = async () => {
    if (!chainConfig || !isEthersApi(signerApi)) {
      return;
    }

    const isValidAmount = isValidNumber(amount);
    if (!isValidAmount) {
      setAmountHasError(true);
      notification.error({
        message: <div>{t(localeKeys.depositAmountValueFormatError)}</div>,
      });
      return;
    }
    const userAmountInEther = BigNumber.from(amount);
    const minimumAllowedAmount = minimumDepositAmount ?? BigNumber.from(1);
    /*Evaluate for the lowest possible amount that can be deposited */
    if (userAmountInEther.lt(minimumAllowedAmount)) {
      setAmountHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.depositAmountError, {
              amount: minimumAllowedAmount.toString(),
              ringSymbol: chainConfig?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }
    /*Deposit amount can not be more than balance */
    const userAmountInWei = parseBalance(amount);
    if (userAmountInWei.gt(balance?.ring ?? BN_ZERO)) {
      setAmountHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.depositAmountMaxError, {
              amount: formatBalance(balance?.ring ?? BN_ZERO, { precision: 8 }),
              tokenSymbol: chainConfig?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }
    try {
      const amountEthersBigNumber = parseBalance(amount);
      const depositContract = new Contract(
        chainConfig.contractAddresses.deposit,
        chainConfig.contractInterface.deposit,
        signerApi.getSigner()
      );
      const response = (await depositContract?.lock(
        amountEthersBigNumber,
        BigNumber.from(depositTerm)
      )) as TransactionResponse;
      await response.wait(1);
      setDepositTerm("1");
      setAmount("");
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      const error = processTransactionError(e as MetaMaskError);
      notification.error({
        message: <div>{error.message}</div>,
      });
      console.log(e);
    }
  };

  return (
    <div>
      <div className={"card flex flex-col gap-[10px]"}>
        <div className={"text-14-bold"}>{t(localeKeys.termDeposit)}</div>
        <div className={"text-halfWhite text-12 divider border-b pb-[10px]"}>
          {t(localeKeys.depositInfo, {
            ringSymbol: chainConfig?.ring.symbol.toUpperCase(),
            ktonSymbol: chainConfig?.kton.symbol.toUpperCase(),
          })}
        </div>
        <div className={"flex flex-col gap-[10px]"}>
          <div className={"flex flex-col lg:flex-row gap-[10px] divider border-b pb-[10px]"}>
            <div className={"flex-1 flex flex-col gap-[10px] shrink-0"}>
              <div className={"text-12"}>{t(localeKeys.amount)}</div>
              <Input
                leftIcon={null}
                rightSlot={
                  <div className={"flex gap-[10px] items-center px-[10px]"}>
                    <img className={"w-[20px]"} src={ringTokenIcon} alt="image" />
                    <div className={"uppercase"}>{(chainConfig?.ring.symbol ?? "RING").toUpperCase()}</div>
                  </div>
                }
                placeholder={t(localeKeys.balanceAmount, {
                  amount: formatBalance(balance?.ring ?? BN_ZERO),
                })}
                value={amount}
                onChange={onAmountChange}
                error={getAmountErrorJSX()}
                hasErrorMessage={false}
              />
            </div>
            <div className={"flex-1 flex flex-col gap-[10px] shrink-0 min-w-0"}>
              <div className={"text-12"}>{t(localeKeys.depositTerm)}</div>
              <Select
                className={"w-full"}
                value={depositTerm}
                onChange={(value) => {
                  onDepositTermChanged(value as string);
                }}
                options={getDepositTerms()}
              />
            </div>
            <div className={"flex-1 flex flex-col gap-[10px] shrink-0"}>
              <div className={"text-12"}>{t(localeKeys.rewardYouReceive)}</div>
              <div className={"h-[40px] px-[10px] bg-primary border-primary border flex items-center justify-between"}>
                <div>
                  <Tooltip message={<div>{formatBalance(rewardedKTON, { precision: 8 })}</div>}>
                    {formatBalance(rewardedKTON)}
                  </Tooltip>
                </div>
                <div className={"uppercase"}>{chainConfig?.kton.symbol}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={"w-full flex flex-col lg:flex-row gap-[10px]"}>
          <Button
            disabled={amount.length === 0}
            onClick={() => {
              onDeposit();
            }}
            className={"w-full lg:w-auto !px-[55px]"}
          >
            {t(localeKeys.deposit)}
          </Button>
        </div>
      </div>
      <DepositRecords />
    </div>
  );
};
