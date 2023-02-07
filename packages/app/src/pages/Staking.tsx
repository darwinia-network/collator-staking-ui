import AccountOverview from "../components/AccountOverview";
import { Tab, Tabs } from "@darwinia/ui";
import { useMemo, useState } from "react";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import StakingOverview from "../components/StakingOverview";
import DepositOverview from "../components/DepositOverview";
import { CSSTransition } from "react-transition-group";
import { Step, Steps } from "intro.js-react";
import { getStore, prettifyNumber, setStore } from "@darwinia/app-utils";
import { UserIntroValues } from "@darwinia/app-types";
import BigNumber from "bignumber.js";
import { useStorage, useWallet } from "@darwinia/app-providers";
import { renderToStaticMarkup } from "react-dom/server";

const Staking = () => {
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const { t } = useAppTranslation();
  const tabTransitionTimeout = 500;
  const [isIntroStepsEnabled, setIntroStepsEnabled] = useState(true);
  const [introCurrentStep, setIntroCurrentStep] = useState(0);
  const { newUserIntroStakingValues } = useStorage();
  const wasIntroShownBefore = getStore<boolean>("wasIntroShown") ?? false;

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

  const onBeforeNextStep = (nextIndex: number) => {
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
  };

  const onTabChange = (selectedTab: Tab) => {
    setActiveTabId(selectedTab.id);
  };

  const tabs: Tab[] = [
    {
      id: "1",
      title: t(localeKeys.staking),
    },
    {
      id: "2",
      title: t(localeKeys.deposit),
    },
  ];

  return (
    <div className={"flex-1 flex flex-col gap-[30px]"}>
      <AccountOverview />
      <div className={"flex flex-col gap-[30px]"}>
        <Tabs onChange={onTabChange} tabs={tabs} activeTabId={activeTabId} />
        <div className={"wrapper relative"}>
          {/*staking overview*/}
          <CSSTransition
            classNames={"tab-content"}
            unmountOnExit={true}
            timeout={{
              enter: tabTransitionTimeout,
              exit: 0,
            }}
            in={activeTabId === "1"}
            key={1}
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
            in={activeTabId === "2"}
            key={2}
          >
            <DepositOverview />
          </CSSTransition>
        </div>
      </div>
      {/*Intro*/}
      {newUserIntroStakingValues && !wasIntroShownBefore && (
        <Steps
          enabled={isIntroStepsEnabled}
          steps={steps}
          initialStep={introCurrentStep}
          onExit={() => {
            setStore("wasIntroShown", true);
            setIntroStepsEnabled(false);
          }}
          onBeforeChange={onBeforeNextStep}
          options={{
            showBullets: false,
            exitOnOverlayClick: false,
          }}
        />
      )}
    </div>
  );
};

const CustomTip = ({ ktonAmount, ringAmount, depositAmount, totalPower }: UserIntroValues) => {
  const { t } = useAppTranslation();
  const { selectedNetwork } = useWallet();

  const bondJSX = (amount: BigNumber, isDeposit = false, symbol = "RING") => {
    return (
      <div className={`text-white`}>
        {prettifyNumber({
          number: amount,
          shouldFormatToEther: true,
        })}{" "}
        {isDeposit ? t(localeKeys.deposit) : ""} {symbol.toUpperCase()}
      </div>
    );
  };

  return (
    <div className={"flex"}>
      <div className={"w-[250px] shrink-0 flex flex-col"}>
        <div className={"py-[13.5px] px-[10px] border-b border-[rgba(255,255,255,0.2)]"}>{t(localeKeys.youStaked)}</div>
        <div className={"flex flex-1 flex-col justify-center px-[10px]"}>
          {prettifyNumber({
            number: totalPower,
            precision: 0,
            shouldFormatToEther: false,
          })}
        </div>
      </div>
      <div className={"flex-1 flex flex-col"}>
        <div className={"py-[13.5px] px-[10px] border-b border-[rgba(255,255,255,0.2)]"}>{t(localeKeys.youStaked)}</div>
        <div className={"flex flex-1 flex-col py-[13px] px-[10px]"}>
          {bondJSX(ringAmount, false, selectedNetwork?.ring.symbol)}
          {bondJSX(depositAmount, true, selectedNetwork?.ring.symbol)}
          {bondJSX(ktonAmount, false, selectedNetwork?.kton.symbol)}
        </div>
      </div>
    </div>
  );
};

export default Staking;
