import Jazzicon from "./jazzicon";
import Image from "next/image";
import CollatorSelectModal from "./collator-select-modal";
import { useCallback, useState } from "react";
import { useAccountName } from "@/hooks";
import { toShortAdrress } from "@/utils";

interface Props {
  collator: string | undefined;
  onSelect: (collator: string) => void;
}

export default function CollatorSelector({ collator, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = useCallback(
    (collator: string) => {
      onSelect(collator);
      setIsOpen(false);
    },
    [onSelect]
  );

  return (
    <>
      {collator ? (
        <div className="flex h-10 items-center gap-middle border border-white px-large transition-opacity">
          <Collator collator={collator} />
          <button
            className="shrink-0 transition-transform hover:scale-105 active:scale-95"
            onClick={() => setIsOpen(true)}
          >
            <Image alt="Switch collator" src="/images/switch.svg" width={24} height={24} />
          </button>
        </div>
      ) : (
        <button
          className="h-10 border border-white text-sm font-light text-white transition-opacity hover:opacity-80 active:opacity-60"
          onClick={() => setIsOpen(true)}
        >
          Select a collator
        </button>
      )}

      <CollatorSelectModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} />
    </>
  );
}

function Collator({ collator }: { collator: string }) {
  const { accountName } = useAccountName(collator);

  return (
    <>
      <Jazzicon address={collator} size={22} />
      <span className="truncate text-sm font-bold text-white">
        {accountName === collator ? toShortAdrress(collator) : accountName}
      </span>
    </>
  );
}
