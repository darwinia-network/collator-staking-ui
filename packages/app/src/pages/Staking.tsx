import { AccountOverview } from "../components/AccountOverview";
import { Tab, Tabs } from "@darwinia/ui";
import { useCallback, useMemo, useState } from "react";
import { localeKeys, useAppTranslation } from "../locale";
import { StakingOverview } from "../components/StakingOverview";
import { DepositOverview } from "../components/DepositOverview";
import { CSSTransition } from "react-transition-group";
import { Step, Steps } from "intro.js-react";
import { formatBalance, getChainConfig, getStore, prettifyNumber, setStore } from "../utils";
import { UserIntroValues, Storage } from "../types";
import { useStaking, useWallet } from "../hooks";
import { renderToStaticMarkup } from "react-dom/server";
import { ethers } from "ethers";

const wasIntroShown = !!getStore<Storage["wasIntroShown"]>("wasIntroShown");
const tabTransitionTimeout = 500;

const Staking = () => {
  const { t } = useAppTranslation();
  const [enabledIntroSteps, setEnabledIntroSteps] = useState(!wasIntroShown);
  const { newUserIntroStakingValues } = useStaking();

  const tabs = useMemo(
    () =>
      [
        {
          id: "staking",
          title: t(localeKeys.staking),
        },
        {
          id: "deposit",
          title: t(localeKeys.deposit),
        },
      ] as Tab[],
    [t]
  );
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const steps: Step[] = useMemo(() => {
    const networkSelection: Step = {
      element: ".pc-network-selector",
      title: "Switch Chain",
      position: "bottom-middle-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title capitalize"}>{t(localeKeys.switchChain)}</div>
          <div className={"text-[10px] font-bold mt-[10px]"}>{t(localeKeys.switchChainInfo)}</div>
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    const stakedTokens: Step = {
      element: ".bonded-tokens",
      position: "top-left-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title capitalize"}>{t(localeKeys.bondedTokens)}</div>
          <div className={"text-[10px] font-bold mt-[10px]"}>{t(localeKeys.bondedTokensInfo)}</div>
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    const selectCollator: Step = {
      element: ".select-collator-btn",
      position: "top-left-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title capitalize"}>{t(localeKeys.selectCollator)}</div>
          <div className={"text-[10px] font-bold mt-[10px]"}>{t(localeKeys.selectCollatorInfo)}</div>
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    const unbondAll: Step = {
      element: ".unbond-all-btn",
      position: "top-left-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title capitalize"}>{t(localeKeys.unbondAll)}</div>
          <div
            className={"text-[10px] font-bold mt-[10px]"}
            dangerouslySetInnerHTML={{ __html: t(localeKeys.unbondAllInfo) }}
          />
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    return [networkSelection, stakedTokens, selectCollator, unbondAll];
  }, [t]);

  const handleBeforeNextStep = useCallback(
    (nextIndex: number) => {
      const introTooltip = document.querySelector(".introjs-tooltip");
      if (!introTooltip || !newUserIntroStakingValues) {
        return;
      }

      if (nextIndex === 1) {
        const topSpace = 17;

        const tooltipHeight = (introTooltip as HTMLDivElement).offsetHeight;
        introTooltip.setAttribute("staked-items-intro", "add");
        const customTip = document.createElement("div");
        customTip.classList.add("staked-items-intro-custom-tip");
        customTip.style.top = `${tooltipHeight + topSpace}px`;

        const mutation = new MutationObserver(() => {
          const tooltipHeight = (introTooltip as HTMLDivElement).offsetHeight;
          customTip.style.top = `${tooltipHeight + topSpace}px`;
        });

        mutation.observe(introTooltip, {
          childList: true,
          attributes: true,
          subtree: true,
        });

        const { ringAmount, ktonAmount, totalPower, depositAmount } = newUserIntroStakingValues;
        const html = renderToStaticMarkup(
          <CustomTip
            ringAmount={ringAmount}
            ktonAmount={ktonAmount}
            depositAmount={depositAmount}
            totalPower={totalPower}
          />
        );
        customTip.innerHTML = `<div class="staked-wrapper">${html}</div>`;
        introTooltip.appendChild(customTip);
      } else {
        const stakedCustomTip = document.querySelector(".staked-items-intro-custom-tip");
        if (stakedCustomTip) {
          stakedCustomTip.remove();
        }
        introTooltip.removeAttribute("staked-items-intro");
      }
    },
    [newUserIntroStakingValues]
  );

  const handleIntroExit = useCallback(() => {
    setEnabledIntroSteps(false);
    setStore("wasIntroShown", true);
  }, []);

  return (
    <div className={"flex-1 flex flex-col gap-[30px]"}>
      <AccountOverview />
      <div className={"flex flex-col gap-[30px]"}>
        <Tabs onChange={({ id }) => setActiveTab(id)} tabs={tabs} activeTabId={activeTab} />
        <div className={"wrapper relative"}>
          {/*staking overview*/}
          <CSSTransition
            classNames={"tab-content"}
            unmountOnExit={true}
            timeout={{
              enter: tabTransitionTimeout,
              exit: 0,
            }}
            in={activeTab === tabs[0].id}
            key={tabs[0].id}
          >
            <StakingOverview />
          </CSSTransition>
          {/*deposit overview*/}
          <CSSTransition
            classNames={"tab-content"}
            unmountOnExit={true}
            timeout={{
              enter: tabTransitionTimeout,
              exit: 0,
            }}
            in={activeTab === tabs[1].id}
            key={tabs[1].id}
          >
            <DepositOverview />
          </CSSTransition>
        </div>
      </div>

      {newUserIntroStakingValues ? (
        <Steps
          enabled={enabledIntroSteps}
          steps={steps}
          initialStep={0}
          onExit={handleIntroExit}
          onBeforeChange={handleBeforeNextStep}
          options={{
            showBullets: false,
            exitOnOverlayClick: false,
          }}
        />
      ) : null}
    </div>
  );
};

const CustomTip = ({ ktonAmount, ringAmount, depositAmount, totalPower }: UserIntroValues) => {
  const { t } = useAppTranslation();
  const { currentChain } = useWallet();

  const bondJSX = (amount: ethers.BigNumber, isDeposit = false, symbol = "RING") => {
    return (
      <div className={`text-white`}>
        {formatBalance(amount)} {isDeposit ? t(localeKeys.deposit) : ""} {symbol.toUpperCase()}
      </div>
    );
  };

  if (currentChain) {
    const chainConfig = getChainConfig(currentChain);
    if (chainConfig) {
      return (
        <div className={"flex"}>
          <div className={"w-[250px] shrink-0 flex flex-col"}>
            <div className={"py-[13.5px] px-[10px] border-b border-[rgba(255,255,255,0.2)]"}>
              {t(localeKeys.youStaked)}
            </div>
            <div className={"flex flex-1 flex-col justify-center px-[10px]"}>
              {prettifyNumber(totalPower.toString())}
            </div>
          </div>
          <div className={"flex-1 flex flex-col"}>
            <div className={"py-[13.5px] px-[10px] border-b border-[rgba(255,255,255,0.2)]"}>
              {t(localeKeys.youStaked)}
            </div>
            <div className={"flex flex-1 flex-col py-[13px] px-[10px]"}>
              {bondJSX(ringAmount, false, chainConfig.ring.symbol)}
              {bondJSX(depositAmount, true, chainConfig.ring.symbol)}
              {bondJSX(ktonAmount, false, chainConfig.kton.symbol)}
            </div>
          </div>
        </div>
      );
    }
  }
  return null;
};

export default Staking;
