import { Key, useState } from "react";
import Selector from "./selector";
import CheckboxGroup from "./checkbox-group";
import { formatBlanace, getChainConfig } from "@/utils";
import { useApp, useStaking } from "@/hooks";

interface Props {
  checkedDeposits: number[];
  onChange?: (values: number[]) => void;
}

export default function ActiveDepositSelector({ checkedDeposits, onChange = () => undefined }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { deposits, stakedDeposits } = useStaking();
  const { activeChain } = useApp();

  const activeDeposits = deposits.filter(({ id }) => !stakedDeposits.includes(id));
  const { nativeToken } = getChainConfig(activeChain);

  return (
    <Selector
      labelClassName="border-white px-middle"
      menuClassName="border border-white p-middle bg-app-black max-h-72 overflow-y-auto"
      label={
        checkedDeposits.length ? (
          <div className="inline-flex items-center gap-middle truncate">
            <span className="text-sm font-light text-white">{`${checkedDeposits.length} ${
              checkedDeposits.length > 1 ? "deposits" : "deposit"
            } selected`}</span>
          </div>
        ) : (
          <span className="text-sm font-light text-white">Use a deposit</span>
        )
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      {activeDeposits.length ? (
        <CheckboxGroup
          options={activeDeposits.map(({ id, value }) => ({
            value: id,
            label: (
              <div key={id} className="flex w-full items-center justify-between">
                <span className="text-sm font-light text-white">{`ID#${id}`}</span>
                <span className="text-sm font-light text-white">{`${formatBlanace(value, nativeToken.decimals, {
                  keepZero: false,
                })} ${nativeToken.symbol}`}</span>
              </div>
            ),
          }))}
          checkedValues={checkedDeposits}
          onChange={onChange as (v: Key[]) => void}
        />
      ) : (
        <span className="text-sm font-normal text-white/50">No active deposit</span>
      )}
    </Selector>
  );
}
