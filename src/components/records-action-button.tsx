import { ButtonHTMLAttributes, forwardRef } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";

const RecordsActionButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }>(
  function BaseButton({ children, ...rest }, ref) {
    return (
      <EnsureMatchNetworkButton
        className={`w-fit border border-primary px-middle py-small text-sm font-light text-white`}
        ref={ref}
        {...rest}
      >
        {children}
      </EnsureMatchNetworkButton>
    );
  }
);

export default RecordsActionButton;
