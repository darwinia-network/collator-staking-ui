import { ChangeEvent, useEffect, useState } from "react";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { Button, Input, OptionProps, Select, notification } from "@darwinia/ui";
import ringIcon from "../../assets/images/ring.svg";
import { useWallet } from "@darwinia/app-providers";
import { calculateKtonFromRingDeposit, parseNumber } from "@darwinia/app-utils";
import DepositRecordsTable from "../DepositRecordsTable";
import BigNumber from "bignumber.js";

const DepositOverview = () => {
  const { t } = useAppTranslation();
  const { selectedNetwork } = useWallet();
  const [depositTerm, setDepositTerm] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [amountHasError, setAmountHasError] = useState<boolean>(false);
  const [rewardedKTON, setRewardedKTON] = useState<string>("0");

  useEffect(() => {
    setDepositTerm("0");
    setAmount("");
    setAmountHasError(false);
  }, []);

  const getDepositTerms = () => {
    const terms: OptionProps[] = [];
    for (let i = 0; i <= 36; i++) {
      let label: JSX.Element | null = null;
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
    const amountValue = parseNumber(amount);

    const kton = calculateKtonFromRingDeposit({
      ringAmount: BigNumber(amountValue ? amount : 0),
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

  const onDeposit = () => {
    const amountValue = parseNumber(amount);
    if (!amountValue) {
      setAmountHasError(true);
      notification.error({
        message: <div>{t(localeKeys.depositAmountValueFormatError)}</div>,
      });
      return;
    }
    console.log("Make a deposit now====", amountValue, depositTerm);
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
                placeholder={t(localeKeys.amount)}
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
