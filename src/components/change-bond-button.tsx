import { ButtonHTMLAttributes } from "react";
import EnsureMatchNetworkButton from "./ensure-match-network-button";

export default function ChangeBondButton({
  action,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { action: "bond" | "unbond" }) {
  return (
    <EnsureMatchNetworkButton
      type="button"
      {...rest}
      className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center border border-white/40 transition-transform hover:scale-105 active:scale-95"
    >
      <span className="text-xs">{action === "bond" ? "+" : "-"}</span>
    </EnsureMatchNetworkButton>
  );
}
