"use client";

import Image from "next/image";
import { PropsWithChildren, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import { useStaking, useApp } from "@/hooks";
import { formatBalanceParts, getChainConfig, notifyTransaction } from "@/utils";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { notification } from "../notification";
import EnsureMatchNetworkButton from "../ensure-match-network-button";
import CountLoading from "../count-loading";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  maskClosable?: boolean;
  className?: string;
  onClose?: () => void;
}

export function MigrationModal({ isOpen, maskClosable = true, onClose = () => undefined }: PropsWithChildren<Props>) {
  const [step1Busy, setStep1Busy] = useState(false);
  const { activeChain } = useApp();
  const { stakedRing, stakedDeposit, stakedDeposits, isLedgersInitialized, isDepositsInitialized } = useStaking();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const total = stakedRing + stakedDeposit;
  const { integer, decimal } = formatBalanceParts(total);

  const currentStep = total > 0n ? 1 : 2;

  const handleUnbond = useCallback(async () => {
    const { contract, explorer } = getChainConfig(activeChain);
    setStep1Busy(true);

    try {
      const { hash } = await writeContract({
        address: contract.staking.address,
        abi: (await import(`@/config/abi/${contract.staking.abiFile}`)).default,
        functionName: "unstake",
        args: [stakedRing || 0n, stakedDeposits || []],
      });

      const receipt = await waitForTransaction({ hash });
      notifyTransaction(receipt, explorer);
    } catch (err) {
      console.error(err);
      notification.error({ description: (err as Error).message });
    } finally {
      setStep1Busy(false);
    }
  }, [activeChain, stakedRing, stakedDeposits]);

  const isLoading = !isLedgersInitialized || !isDepositsInitialized;

  return (
    <>
      {createPortal(
        <CSSTransition
          in={isOpen}
          timeout={300}
          nodeRef={nodeRef}
          classNames="modal-fade"
          unmountOnExit
          onEnter={() => {
            document.body.style.overflow = "hidden";
          }}
          onExited={() => {
            document.body.style.overflow = "auto";
          }}
        >
          <div
            ref={nodeRef}
            className="fixed inset-0 z-30 flex items-center justify-center bg-app-black/80 px-large"
            onClick={() => maskClosable && onClose()}
          >
            <div className="relative flex w-full flex-col md:w-[450px]" onClick={(e) => e.stopPropagation()}>
              <Image
                alt="Close modal"
                width={24}
                height={24}
                src="/images/close-white.svg"
                className="absolute right-2.5 top-2.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                onClick={onClose}
              />
              <div className={`h-full bg-component p-5`}>
                <div className="flex flex-col items-center gap-5">
                  <Image src="/images/token/ring.svg" alt="ring" width={60} height={60} />
                  <div className="flex flex-col items-center gap-2.5">
                    <p className="text-sm font-light text-white">Reserved in Staking</p>
                    <p className="text-2xl font-bold">
                      <span className="text-[#FF0083]">{integer}</span>
                      <span className="text-white/50">.{decimal}</span>
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 flex w-full flex-col gap-5"
                  style={{ pointerEvents: !isLoading ? "auto" : "none" }}
                >
                  <EnsureMatchNetworkButton
                    className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
                    onClick={handleUnbond}
                    disabled={currentStep !== 1 || isLoading}
                    busy={step1Busy}
                  >
                    {total === 0n ? (
                      <span className="flex items-center justify-center gap-1">
                        <span>No Unstake required</span>
                        <Image src="/images/status/success-white.svg" alt="success" width={26} height={26} />
                      </span>
                    ) : (
                      "Step1: Unstake"
                    )}
                  </EnsureMatchNetworkButton>

                  {currentStep === 2 ? (
                    <Link
                      href="https://ringdao.notion.site/How-do-you-migrate-your-deposits-fffaad1d671e81ab8caeddf83974b9ad"
                      passHref
                      target="_blank"
                      rel="noopener"
                    >
                      <EnsureMatchNetworkButton
                        className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
                        disabled={isLoading}
                      >
                        Step2: Migrate
                      </EnsureMatchNetworkButton>
                    </Link>
                  ) : (
                    <EnsureMatchNetworkButton
                      className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
                      disabled
                    >
                      Step2: Migrate
                    </EnsureMatchNetworkButton>
                  )}

                  {currentStep === 2 ? (
                    <Link href="https://collator-staking.ringdao.com" passHref target="_blank" rel="noopener">
                      <EnsureMatchNetworkButton
                        className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
                        disabled={isLoading}
                      >
                        Step3: Stake in new pool
                      </EnsureMatchNetworkButton>
                    </Link>
                  ) : (
                    <EnsureMatchNetworkButton
                      className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white"
                      disabled
                    >
                      Step3: Stake in new pool
                    </EnsureMatchNetworkButton>
                  )}
                </div>
              </div>
              {isLoading && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/5">
                  <CountLoading color="white" />
                </div>
              )}
            </div>
          </div>
        </CSSTransition>,
        document.body
      )}
    </>
  );
}

//
