import "./styles.scss";
import { useCallback, useEffect, useState } from "react";
import checkedIcon from "../../assets/images/checkbox-checked.svg";
import uncheckedIcon from "../../assets/images/checkbox-unchecked.svg";

export interface CheckboxProps<T> {
  render: (option: T) => JSX.Element;
  onChange: (selectedOption: T, allSelectedOptions: T[]) => void;
  selectedOptions: T[];
  options: T[];
  className?: string;
}

export interface CheckboxItem extends Object {
  id: string | number;
}

const CheckboxGroup = <T extends CheckboxItem>({
  selectedOptions,
  render,
  onChange,
  options,
  className,
}: CheckboxProps<T>) => {
  const [selected, setSelected] = useState<T[]>([]);
  /*Makes sure that the list outside and inside the component is synced */
  useEffect(() => {
    setSelected(selectedOptions);
  }, [selectedOptions]);

  const onSelectionChange = (option: T, shouldSelect: boolean) => {
    const newAllSelected = shouldSelect ? [...selected, option] : selected.filter((item) => item.id !== option.id);
    setSelected(newAllSelected);
    onChange(option, newAllSelected);
  };

  return (
    <div className={`dw-checkbox-wrapper ${className}`}>
      {options.map((option) => {
        const isChecked = !!selected.find((item) => item.id === option.id);
        return (
          <div
            onClick={() => {
              onSelectionChange(option, !isChecked);
            }}
            className={"dw-checkbox-option"}
            key={option.id}
          >
            <img className={"dw-checkbox-icon"} src={isChecked ? checkedIcon : uncheckedIcon} alt="image" />
            <div className={"dw-option-render"}>{render(option)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckboxGroup;
