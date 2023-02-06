import { ChangeEvent, useEffect, useState } from "react";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { Button, Input, OptionProps, Select, notification } from "@darwinia/ui";
import ringIcon from "../../assets/images/ring.svg";
import { useStorage, useWallet } from "@darwinia/app-providers";
import {
  calculateKtonFromRingDeposit,
  isValidNumber,
  formatToWei,
  prettifyNumber,
  formatToEther,
} from "@darwinia/app-utils";
import DepositRecordsTable from "../DepositRecordsTable";
import BigNumber from "bignumber.js";
import { BigNumber as EthersBigNumber } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";

const DepositOverview = () => {
  const { t } = useAppTranslation();
  const { selectedNetwork, depositContract, setTransactionStatus } = useWallet();
  const { minimumDepositAmount, balance } = useStorage();
  const [depositTerm, setDepositTerm] = useState<string>("1");
  const [amount, setAmount] = useState<string>("");
  const [amountHasError, setAmountHasError] = useState<boolean>(false);
  const [rewardedKTON, setRewardedKTON] = useState<string>("0");
  const precision = 3;

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
    const isNumber = isValidNumber(amount);

    const kton = calculateKtonFromRingDeposit({
      ringAmount: BigNumber(isNumber ? amount : 0),
      depositMonths: Number(depositTerm),
    });
    setRewardedKTON(kton);
  }, [depositTerm, amount]);

  const onDepositTermChanged = (value: string) => {
    setDepositTerm(value);
  };

  const onAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmountHasError(false);
    setAmount(event.target.value);
  };

  const onDeposit = async () => {
    const isValidAmount = isValidNumber(amount);
    if (!isValidAmount) {
      setAmountHasError(true);
      notification.error({
        message: <div>{t(localeKeys.depositAmountValueFormatError)}</div>,
      });
      return;
    }
    const userAmountInEther = BigNumber(amount);
    const minimumAllowedAmount = minimumDepositAmount ?? BigNumber(1);
    /*Evaluate for the lowest possible amount that can be deposited */
    if (userAmountInEther.lt(minimumAllowedAmount)) {
      setAmountHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.depositAmountError, {
              amount: minimumAllowedAmount.toString(),
              ringSymbol: selectedNetwork?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }
    /*Deposit amount can not be more than balance */
    const userAmountInWei = BigNumber(formatToWei(amount).toString());
    if (userAmountInWei.gt(balance?.ring ?? BigNumber(0))) {
      setAmountHasError(true);
      notification.error({
        message: (
          <div>
            {t(localeKeys.depositAmountMaxError, {
              amount: prettifyNumber({
                number: balance?.ring ?? BigNumber(0),
                shouldFormatToEther: true,
                precision: precision,
              }),
              tokenSymbol: selectedNetwork?.ring.symbol,
            })}
          </div>
        ),
      });
      return;
    }
    try {
      const amountEthersBigNumber = formatToWei(amount.toString());
      setTransactionStatus(true);
      const response = (await depositContract?.lock(
        amountEthersBigNumber,
        EthersBigNumber.from(depositTerm)
      )) as TransactionResponse;
      await response.wait(1);
      setTransactionStatus(false);
      setDepositTerm("1");
      setAmount("");
      notification.success({
        message: <div>{t(localeKeys.operationSuccessful)}</div>,
      });
    } catch (e) {
      setTransactionStatus(false);
      notification.error({
        message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
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
            ringSymbol: selectedNetwork?.ring.symbol.toUpperCase(),
            ktonSymbol: selectedNetwork?.kton.symbol.toUpperCase(),
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
                    <img className={"w-[20px]"} src={ringIcon} alt="image" />
                    <div className={"uppercase"}>{(selectedNetwork?.ring.symbol ?? "RING").toUpperCase()}</div>
                  </div>
                }
                placeholder={t(localeKeys.balanceAmount, {
                  amount: prettifyNumber({
                    number: balance?.ring ?? BigNumber(0),
                    shouldFormatToEther: true,
                    precision: precision,
                  }),
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
                <div>{rewardedKTON}</div>
                <div className={"uppercase"}>{selectedNetwork?.kton.symbol}</div>
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
      <DepositRecordsTable />
    </div>
  );
};

export default DepositOverview;
