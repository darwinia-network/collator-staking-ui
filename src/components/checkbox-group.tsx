import { Key, ReactElement } from "react";

interface Props {
  options: {
    label: ReactElement;
    value: Key;
  }[];
  checkedValues: Key[];
  onChange?: (values: Key[]) => void;
  className?: string;
}

export default function CheckboxGroup({ options, checkedValues, className, onChange = () => undefined }: Props) {
  return (
    <div className={`flex flex-col gap-large ${className}`}>
      {options.map(({ label, value }) => {
        const idx = checkedValues.findIndex((v) => v === value);
        const checked = idx >= 0;

        return (
          <div key={value} className="flex items-center gap-middle">
            <button
              className={`relative h-4 w-4 rounded-sm border transition hover:scale-105 active:scale-95 ${
                checked ? "border-primary bg-primary" : "border-white bg-transparent"
              }`}
              onClick={() => {
                const checkeds = [...checkedValues];
                if (checked) {
                  checkeds.splice(idx, 1);
                } else {
                  checkeds.push(value);
                }
                onChange(checkeds);
              }}
            >
              <div
                className={`absolute left-1 top-[1px] h-middle w-small rotate-45 border-b-[2px] border-r-[2px] ${
                  checked ? "visible" : "invisible"
                }`}
              />
            </button>
            {label}
          </div>
        );
      })}
    </div>
  );
}
