import { useApp } from "@/hooks";
import { StakingRecordsDataSource } from "@/types";
import { formatBlanace, getChainConfig } from "@/utils";
import UnbondingTokenTooltip from "./unbonding-token-tooltip";
import UnbondingDepositTooltip from "./unbonding-deposit-tooltip";
import { useState } from "react";
import ChangeBondButton from "./change-bond-button";
import BondMoreRingModal from "./bond-more-ring-modal";
import BondMoreKtonModal from "./bond-more-kton-modal";
import BondMoreDepositModal from "./bond-more-deposit-modal";
import UnbondRingModal from "./unbond-ring-modal";
import UnbondKtonModal from "./unbond-kton-modal";
import UnbondDepositModal from "./unbond-deposit-modal";

export default function RecordsBondedTokens({ row }: { row: StakingRecordsDataSource }) {
  const { activeChain } = useApp();
  const { nativeToken, ktonToken } = getChainConfig(activeChain);

  return (
    <div className="flex flex-col">
      {/* ring */}
      <div className="flex items-center gap-small">
        <UnbondingTokenTooltip unbondings={row.bondedTokens.unbondingRing} token={nativeToken}>
          <span className={`truncate ${row.bondedTokens.unbondingRing.length > 0 ? "text-white/50" : "text-white"}`}>
            {formatBlanace(row.bondedTokens.stakedRing, nativeToken.decimals, { keepZero: false })} {nativeToken.symbol}
          </span>
        </UnbondingTokenTooltip>
        {row.collator.length > 0 && (
          <>
            <BondMoreRing />
            <UnbondRing />
          </>
        )}
      </div>
      {/* deposit */}
      <div className="flex items-center gap-small">
        <UnbondingDepositTooltip unbondings={row.bondedTokens.unbondingDeposits} token={nativeToken}>
          <span
            className={`truncate ${row.bondedTokens.unbondingDeposits.length > 0 ? "text-white/50" : "text-white"}`}
          >
            {formatBlanace(row.bondedTokens.totalOfDepositsInStaking, nativeToken.decimals, { keepZero: false })}{" "}
            Deposit {nativeToken.symbol}
          </span>
        </UnbondingDepositTooltip>
        {row.collator.length > 0 && (
          <>
            <BondMoreDeposit />
            <UnbondDeposit />
          </>
        )}
      </div>
      {/* kton */}
      <div className="flex items-center gap-small">
        <UnbondingTokenTooltip unbondings={row.bondedTokens.unbondingKton} token={ktonToken || nativeToken}>
          <span className={`truncate ${row.bondedTokens.unbondingKton.length > 0 ? "text-white/50" : "text-white"}`}>
            {formatBlanace(row.bondedTokens.stakedKton, ktonToken?.decimals, { keepZero: false })} {ktonToken?.symbol}
          </span>
        </UnbondingTokenTooltip>
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
