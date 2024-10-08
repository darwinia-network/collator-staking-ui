"use client";

import Image from "next/image";
import { PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import { useStaking } from "@/hooks";
import { formatBalanceParts } from "@/utils";
import EnsureMatchNetworkButton from "../ensure-match-network-button";
import Link from "next/link";
import CountLoading from "../count-loading";

interface Props {
  isOpen: boolean;
  maskClosable?: boolean;
  className?: string;
  onClose?: () => void;
}

export function MigrationModal({ isOpen, maskClosable = true, onClose = () => undefined }: PropsWithChildren<Props>) {
  const { stakedRing, stakedDeposit, isLedgersInitialized, isDepositsInitialized } = useStaking();

  const nodeRef = useRef<HTMLDivElement | null>(null);

  const total = stakedRing + stakedDeposit;
  const { integer, decimal } = formatBalanceParts(total);

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

                <div className="mt-5 flex w-full flex-col gap-5">
                  <Link href="https://migration-helper.darwinia.network" passHref target="_blank" rel="noopener">
                    <EnsureMatchNetworkButton className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white">
                      Step 1: Unstake and Migrate
                    </EnsureMatchNetworkButton>
                  </Link>

                  <Link href="https://collator-staking.ringdao.com" passHref target="_blank" rel="noopener">
                    <EnsureMatchNetworkButton className="h-10 w-full border border-primary bg-primary text-sm font-bold text-white">
                      Step 2: Stake in New Pool
                    </EnsureMatchNetworkButton>
                  </Link>
                  <p className=" text-center text-sm font-light text-gray-500">
                    🔔 Need help? Check out{" "}
                    <a
                      href="https://ringdao.notion.site/How-to-unstake-and-migrate-your-assets-119aad1d671e80ea990cceea71334b89"
                      target="_blank"
                      rel="noopener"
                      className="text-[#FF0083]"
                    >
                      the tutorial
                    </a>{" "}
                    for detailed instructions.
                  </p>
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
