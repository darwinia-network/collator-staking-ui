import { FC, ButtonHTMLAttributes } from "react";

const ActionButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
  <button
    {...rest}
    className="text-sm font-light text-white hover:opacity-80 active:opacity-60 disabled:cursor-not-allowed disabled:text-white/50 disabled:opacity-100"
  >
    {children}
  </button>
);

export default ActionButton;
