import { useApp, useIsStakingV2 } from "@/hooks";
import { StakingRecordsDataSource } from "@/types";
import { formatBlanace, getChainConfig, notifyTransaction } from "@/utils";
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
import { notification } from "./notification";
import { usePublicClient, useWalletClient } from "wagmi";

export default function RecordsBondedTokens({ row }: { row: StakingRecordsDataSource }) {
  const [ringBusy, setRingBusy] = useState(false);
  const [depositBusy, setDepositBusy] = useState(false);
  const [ktonBusy, setKtonBusy] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const isStakingV2 = useIsStakingV2();
  const { activeChain } = useApp();
  const { nativeToken, ktonToken } = getChainConfig(activeChain);

  const handleCancelUnbonding = useCallback(
    async (ring: bigint, kton: bigint, depositIds: number[]) => {
      if (ring > 0) {
        setRingBusy(true);
      } else if (kton > 0) {
        setKtonBusy(true);
      } else if (depositIds.length) {
        setDepositBusy(true);
      }
      const { contract, explorer } = getChainConfig(activeChain);

      if (walletClient && publicClient) {
        try {
          const abi = isStakingV2
            ? (await import("@/config/abi/staking-v2.json")).default
            : (await import("@/config/abi/staking.json")).default;
          const args = isStakingV2 ? [ring, depositIds] : [ring, kton, depositIds];

          const hash = await walletClient.writeContract({
            address: contract.staking.address,
            abi,
            functionName: "restake",
            args,
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          notifyTransaction(receipt, explorer);
        } catch (err) {
          console.error(err);
          notification.error({ description: (err as Error).message });
        }
      }

      if (ring > 0) {
        setRingBusy(false);
      } else if (kton > 0) {
        setKtonBusy(false);
      } else if (depositIds.length) {
        setDepositBusy(false);
      }
    },
    [activeChain, isStakingV2, walletClient, publicClient]
  );

  const handleRelease = useCallback(
    async (type: "ring" | "kton" | "deposit") => {
      if (type === "ring") {
        setRingBusy(true);
      } else if (type === "kton") {
        setKtonBusy(true);
      } else {
        setDepositBusy(true);
      }
      const { contract, explorer } = getChainConfig(activeChain);

      if (walletClient && publicClient) {
        try {
          const hash = await walletClient.writeContract({
            address: contract.staking.address,
            abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
            functionName: "claim",
            args: [],
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          notifyTransaction(receipt, explorer);
        } catch (err) {
          console.error(err);
          notification.error({ description: (err as Error).message });
        }
      }

      if (type === "ring") {
        setRingBusy(false);
      } else if (type === "kton") {
        setKtonBusy(false);
      } else {
        setDepositBusy(false);
      }
    },
    [activeChain, walletClient, publicClient]
  );

  return (
    <div className="flex flex-col">
      {/* ring */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingRing.length > 0 ? (
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
            <BondMoreRing commission={row.commission} />
            <UnbondRing commission={row.commission} />
          </>
        )}
      </div>
      {/* deposit */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingDeposits.length > 0 ? (
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
            <BondMoreDeposit commission={row.commission} />
            <UnbondDeposit commission={row.commission} />
          </>
        )}
      </div>
      {/* kton */}
      <div className="flex items-center gap-small">
        {row.bondedTokens.unbondingKton.length > 0 ? (
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
            <UnbondKton commission={row.commission} />
          </>
        )}
      </div>
    </div>
  );
}

function BondMoreRing({ commission }: { commission: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="bond" onClick={() => setIsOpen(true)} />
      <BondMoreRingModal commission={commission} isOpen={isOpen} onClose={() => setIsOpen(false)} />
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

function BondMoreDeposit({ commission }: { commission: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="bond" onClick={() => setIsOpen(true)} />
      <BondMoreDepositModal commission={commission} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondRing({ commission }: { commission: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondRingModal commission={commission} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondKton({ commission }: { commission: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondKtonModal commission={commission} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function UnbondDeposit({ commission }: { commission: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ChangeBondButton action="unbond" onClick={() => setIsOpen(true)} />
      <UnbondDepositModal commission={commission} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function BusyIcon() {
  return (
    <div className="h-[14px] w-[14px] shrink-0 animate-spin rounded-full border-2 border-b-white/50 border-l-white/50 border-r-white border-t-white" />
  );
}
