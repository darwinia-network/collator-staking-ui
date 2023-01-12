import AccountOverview from "../components/AccountOverview";
import { Tab, Tabs } from "@darwinia/ui";
import { useMemo, useState } from "react";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import StakingOverview from "../components/StakingOverview";
import DepositOverview from "../components/DepositOverview";
import { CSSTransition } from "react-transition-group";
import { Step, Steps } from "intro.js-react";

const Staking = () => {
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const { t } = useAppTranslation();
  const tabTransitionTimeout = 500;
  const [isIntroStepsEnabled, setIntroStepsEnabled] = useState(true);
  const [introCurrentStep, setIntroCurrentStep] = useState(0);

  const steps: Step[] = useMemo(() => {
    const networkSelection: Step = {
      element: ".pc-network-selector",
      title: "Switch Chain",
      position: "bottom-middle-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title"}>Switch Chain</div>
          <div className={"text-[10px] font-bold mt-[10px]"}>
            You can choose the Chain in which you want to participate in Staking or deposit here.
          </div>
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    const amountStaked: Step = {
      element: ".bonded-tokens",
      position: "top-left-aligned",
      intro: (
        <div>
          <div className={"text-14-bold title"}>Switch Chain</div>
          <div className={"text-[10px] font-bold mt-[10px]"}>
            You can choose the Chain in which you want to participate in Staking or deposit here.
          </div>
        </div>
      ),
      tooltipClass: "intro-step-tooltip",
      highlightClass: "intro-step-heighlight",
    };

    return [networkSelection, amountStaked];
  }, [t]);

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
      <Steps
        enabled={isIntroStepsEnabled}
        steps={steps}
        initialStep={introCurrentStep}
        onExit={(stepIndex) => {
          // may be not a Number
          console.log(stepIndex);

          setIntroStepsEnabled(false);
        }}
        options={{
          showBullets: false,
          exitOnOverlayClick: false,
        }}
      />
    </div>
  );
};

export default Staking;
