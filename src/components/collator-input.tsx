import Image from "next/image";
import Tooltip from "./tooltip";

export default function CollatorInput({
  label,
  tooltip,
  suffix,
  placeholder,
  onChange = () => undefined,
}: {
  label: string;
  tooltip?: string;
  suffix?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-small lg:gap-middle">
      <div className="inline-flex items-center gap-middle">
        <span className="text-xs font-bold text-white">{label}</span>
        {tooltip && (
          <Tooltip content={<span className="text-xs font-light text-white">{tooltip}</span>} contentClassName="w-64">
            <Image alt="Tooltip" width={16} height={16} src="/images/help.svg" />
          </Tooltip>
        )}
      </div>
      <div className="flex h-10 shrink-0 items-center justify-between border border-white/50 px-middle transition-colors focus-within:border-white hover:border-white">
        <input
          placeholder={placeholder}
          className={`h-full bg-transparent text-sm font-bold focus-visible:outline-none ${
            suffix ? "w-11/12" : "w-full"
          }`}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="text-xs font-bold text-white">{suffix}</span>}
      </div>
    </div>
  );
}
