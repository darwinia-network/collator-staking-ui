import { useAccountName } from "@/hooks";
import Tooltip from "./tooltip";
import { toShortAdrress } from "@/utils";

export default function DisplayAccountName({ address }: { address: string }) {
  const { accountName } = useAccountName(address);
  return (
    <>
      <span className="inline lg:hidden">{toShortAdrress(accountName)}</span>
      <Tooltip
        content={
          <div className="flex flex-col">
            {address !== accountName && <span className="text-xs font-bold text-white">{accountName}</span>}
            <span className="text-xs font-light text-white">{address}</span>
          </div>
        }
        className="hidden truncate lg:inline"
      >
        {address === accountName ? <span>{toShortAdrress(address)}</span> : <span>{accountName}</span>}
      </Tooltip>
    </>
  );
}
