import { useApp, useDip6 } from "@/hooks";
import { StakingRecordsDataSource } from "@/types";
import { formatBlanace, getChainConfig } from "@/utils";
import UnbondingTokenTooltip from "./unbonding-token-tooltip";
import UnbondingDepositTooltip from "./unbonding-deposit-tooltip";
import { useCallback, useState } from "react";
import ChangeBondButton from "./change-bond-button";
import BondMoreRingModal from "./bond-more-ring-modal";
import BondMoreKtonModal from "./bond-more-kton-modal";
import BondMoreDepositModal from "./bond-more-deposit-modal";
import UnbondRingModal from "./unbond-ring-modal";
import UnbondKtonModal from "./unbond-kton-modal";
import UnbondDepositModal from "./unbond-deposit-modal";
import Image from "next/image";

export default function RecordsBondedTokens({ row }: { row: StakingRecordsDataSource }) {
  const [ringBusy, _setRingBusy] = useState(false);
  const [depositBusy, _setDepositBusy] = useState(false);
  const [ktonBusy, _setKtonBusy] = useState(false);

  const { activeChain } = useApp();
  const { isDip6Implemented } = useDip6();
  const { nativeToken, ktonToken } = getChainConfig(activeChain);

  const handleCancelUnbonding = useCallback(async (_ring: bigint, _kton: bigint, _depositIds: number[]) => {}, []);
  const handleRelease = useCallback(async (_type: "ring" | "kton" | "deposit") => {}, []);

  return (
    <div className="flex flex-col">
      {/* ring */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingRing.length > 0 && !isDip6Implemented ? (
          ringBusy ? (
            <BusyIcon />
          ) : (
            <UnbondingTokenTooltip
              unbondings={row.bondedTokens.unbondingRing}
              token={nativeToken}
              onCancelUnbonding={handleCancelUnbonding}
              onRelease={handleRelease}
            >
              <Image width={14} height={14} alt="Info" src="/images/info.svg" className="shrink-0" />
            </UnbondingTokenTooltip>
          )
        ) : (
          <div className="w-[14px] shrink-0" />
        )}
        <span className={`truncate ${row.bondedTokens.unbondingRing.length > 0 ? "text-white/50" : "text-white"}`}>
          {formatBlanace(row.bondedTokens.stakedRing, nativeToken.decimals, { keepZero: false })} {nativeToken.symbol}
        </span>
        {row.collator.length > 0 && (
          <>
            <BondMoreRing />
            <UnbondRing />
          </>
        )}
      </div>
      {/* deposit */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingDeposits.length > 0 && !isDip6Implemented ? (
          depositBusy ? (
            <BusyIcon />
          ) : (
            <UnbondingDepositTooltip
              unbondings={row.bondedTokens.unbondingDeposits}
              token={nativeToken}
              onCancelUnbonding={handleCancelUnbonding}
              onRelease={handleRelease}
            >
              <Image width={14} height={14} alt="Info" src="/images/info.svg" className="shrink-0" />
            </UnbondingDepositTooltip>
          )
        ) : (
          <div className="w-[14px] shrink-0" />
        )}
        <span className={`truncate ${row.bondedTokens.unbondingDeposits.length > 0 ? "text-white/50" : "text-white"}`}>
          {formatBlanace(row.bondedTokens.stakedDeposit, nativeToken.decimals, { keepZero: false })} Deposit{" "}
          {nativeToken.symbol}
        </span>
        {row.collator.length > 0 && (
          <>
            <BondMoreDeposit />
            <UnbondDeposit />
          </>
        )}
      </div>
      {/* kton */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingKton.length > 0 && !isDip6Implemented ? (
          ktonBusy ? (
            <BusyIcon />
          ) : (
            <UnbondingTokenTooltip
              unbondings={row.bondedTokens.unbondingKton}
              token={ktonToken || nativeToken}
              onCancelUnbonding={handleCancelUnbonding}
              onRelease={handleRelease}
            >
              <Image width={14} height={14} alt="Info" src="/images/info.svg" className="shrink-0" />
            </UnbondingTokenTooltip>
          )
        ) : (
          <div className="w-[14px] shrink-0" />
        )}
        <span className={`truncate ${row.bondedTokens.unbondingKton.length > 0 ? "text-white/50" : "text-white"}`}>
          {formatBlanace(row.bondedTokens.stakedKton, ktonToken?.decimals, { keepZero: false })} {ktonToken?.symbol}
        </span>
        {row.collator.length > 0 && (
          <>
            <BondMoreKton />
            <UnbondKton />
          </>
        )}
      </div>
    </div>
  );
}

function BondMoreRing() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="bond" onClick={() => setIsOpen(true)} />
      <BondMoreRingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function BondMoreKton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="bond" onClick={() => setIsOpen(true)} />
      <BondMoreKtonModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function BondMoreDeposit() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="bond" onClick={() => setIsOpen(true)} />
      <BondMoreDepositModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondRing() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondRingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondKton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondKtonModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondDeposit() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondDepositModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function BusyIcon() {
  return (
    <div className="h-[14px] w-[14px] shrink-0 animate-spin rounded-full border-2 border-b-white/50 border-l-white/50 border-r-white border-t-white" />
  );
}
