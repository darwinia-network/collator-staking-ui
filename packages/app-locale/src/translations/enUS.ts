import { localeKeys } from "../localeKeys";
const enUs = {
  [localeKeys.welcomeToReact]: "Welcome To React 👏",
  [localeKeys.messagesCounter]: `Hello {{user}}, <i><strong style="color: yellow;">you've</strong></i> got {{counter}} messages.`,
  [localeKeys.menu]: "Menu",
  [localeKeys.goHome]: "Go home",
  [localeKeys.pageNotFound]: "Page not found",
  [localeKeys.confirm]: "Confirm",
  [localeKeys.cancel]: "Cancel",
  [localeKeys.darwiniaNetwork]: "Darwinia network",
  [localeKeys.connectWallet]: "Connect wallet",
  [localeKeys.connectToMetamask]: "Connect to metaMask",
  [localeKeys.connectWalletInfo]: "Connect wallet to participate in Staking and Deposit in Darwinia.",
  [localeKeys.latestStakingRewards]: "Latest staking rewards",
  [localeKeys.reservedInStaking]: "Reserved in staking",
  [localeKeys.bonded]: "Bonded",
  [localeKeys.inDeposit]: "In deposit",
  [localeKeys.seeDetailed]: `See detailed staking rewards in `,
  [localeKeys.noRewards]: "No rewards yet",
  [localeKeys.staking]: "Staking",
  [localeKeys.deposit]: "Deposit",
  [localeKeys.delegate]: "Delegate",
  [localeKeys.selectCollator]: "Select a collator",
  [localeKeys.stakingBasicInfo]: `Note that it takes 1 session(～{{sessionTime}}) to get rewards if your collator get elected. The delegation locks your tokens, and You need to unbond in order for your staked tokens to be transferrable again, which takes ～{{unbondTime}}.`,
  [localeKeys.balanceAmount]: "Balance: {{amount}}",
  [localeKeys.useDeposit]: "Use a deposit",
  [localeKeys.stake]: "Stake",
  [localeKeys.noDelegation]: "No delegation",
  [localeKeys.waitingCollatorWarning]: `This collator is currently in the waiting pool. The rewards will not be earned until the collator joins the active pool.`,
  [localeKeys.powerNotWorking]: `The power is not working yet, You can delegate a collator to complete staking.`,
  [localeKeys.unbondAll]: "Unbond all",
  [localeKeys.changeCollator]: "Change collator",
  [localeKeys.loading]: "Loading",
  [localeKeys.undelegationInfo]: `Undelegation is executable in {{undelegationTime}}`,
  [localeKeys.executeUndelegation]: "Execute Undelegation",
  [localeKeys.execute]: "Execute",
  [localeKeys.commission]: "Commission",
  [localeKeys.collator]: "Collator",
  [localeKeys.rewardLastSession]: "Your Rewards Last Session / In Total",
  [localeKeys.youStaked]: "You Staked (Power)",
  [localeKeys.yourBondedTokens]: "Your Bonded Tokens",
  [localeKeys.approveKton]: "Approve {{token}}",
  [localeKeys.depositSelected]: "{{number}} deposits selected",
  [localeKeys.power]: "Power",
  [localeKeys.sessionKey]: "Session key",
  [localeKeys.stopCollating]: "Stop collating",
  [localeKeys.stopCollation]: "Stop Collation",
  [localeKeys.undelegate]: "Undelegate",
  [localeKeys.bond]: "Bond",
  [localeKeys.unbond]: "Unbond",
  [localeKeys.bondMore]: "Bond more",
  [localeKeys.unbondTimeInfo]: "This unbonding process will take {{unbondingTime}} to complete.",
  [localeKeys.amount]: "Amount",
  [localeKeys.bondMoreDeposits]: "Bond more deposits",
  [localeKeys.unbondDeposits]: "Unbond deposits",
  [localeKeys.updateCommission]: "Update Commission",
  [localeKeys.commissionPercentInfo]: "The percent a collator takes off the top of the due staking rewards.",
  [localeKeys.update]: "Update",
  [localeKeys.updateSessionKey]: "Update Session Key",
  [localeKeys.sureToUndelegate]: "sure to undelegate now?",
  [localeKeys.undelegationConfirmInfo]: `The undelegation takes {{unbondingTime}} and then it will have to be manually executed to make those tokens transferrable. The power won’t work immediately after you undelegate the collator.`,
  [localeKeys.tokensToBeReleased]: `{{amount}} {{token}} is unbonding and will be released in {{timeLeft}}.`,
  [localeKeys.cancelUnbonding]: "Cancel unbonding",
  [localeKeys.tokensReadyToRelease]: `{{amount}} {{token}} has complete the unbonding exit delay period.`,
  [localeKeys.releaseNow]: "Release them now",
  [localeKeys.depositsToBeReleased]: `{{amount}} Deposit {{ringSymbol}} is unbonding and will be released to deposit in {{timeLeft}}.`,
  [localeKeys.depositsReadyToRelease]: `{{amount}} {{ringSymbol}} has complete the unbonding exit delay period.`,
  [localeKeys.releaseThem]: "Release them",
  [localeKeys.toTermDeposit]: "to term deposit.",
  [localeKeys.activePool]: "Active pool",
  [localeKeys.activePool]: "Active pool",
  [localeKeys.waitingPool]: "Waiting pool",
  [localeKeys.joinCollator]: "Join collator",
  [localeKeys.activePoolInfo]: "These candidates are in the active collator pool of the current Session.",
  [localeKeys.searchForCollator]: "Search for a collator",
  [localeKeys.blocksLastSession]: `Blocks <div>last session</div>`,
  [localeKeys.totalStaked]: "Total-staked (Power)",
  [localeKeys.howToJoinCollator]: `Note that you need to complete two steps in sequence, setup [Session Key] and setup [Commission] before becoming a collator. Please <a target="_blank" href={{runNodeUrl}} class="link link-primary">Run A Node</a> first and get the session key of your running node. <a target="_blank" href={{tutorialUrl}} class="link link-primary">Tutorial</a> `,
  [localeKeys.termDeposit]: "Term Deposit",
  [localeKeys.depositInfo]:
    "Deposit {{ringSymbol}} for a fixed term and earn {{ktonSymbol}}, and the {{ringSymbol}} in deposit can used in Staking as Well. Note that if you withdraw the funds before the term ends, you have to pay 3 times the reward as a penalty.",
  [localeKeys.depositTerm]: "Deposit Term",
  [localeKeys.rewardYouReceive]: `Reward You'll Receive`,
  [localeKeys.activeDepositRecords]: "Active Deposit Records",
  [localeKeys.noDepositRecords]: "No Active Deposit Records",
  [localeKeys.month]: "{{number}} month",
  [localeKeys.months]: "{{number}} months",
  [localeKeys.noFixedTerm]: "No fixed term",
  [localeKeys.stakingDelegation]: "Staking Delegation",
  [localeKeys.withdrawEarlier]: "Withdraw Earlier",
  [localeKeys.withdraw]: "Withdraw",
  [localeKeys.sureToWithdraw]: "Sure to withdraw now?",
  [localeKeys.payAmount]: "Pay {{amount}}",
  [localeKeys.earlyWithdrawInfo]:
    "Since the deposit term doesn’t end yet, you’ll be charged a penalty of 3 times the {{ktonSymbol}} reward if you try to withdraw the {{ringSymbol}}s in advance.",
  [localeKeys.withdrawInfo]: `Withdraw at a regular time`,
  [localeKeys.serialNumber]: "No.",
  [localeKeys.duration]: "Duration",
  [localeKeys.reward]: "Reward",
  [localeKeys.action]: "Action",
  [localeKeys.earlyWithdrawMessage]: "Early withdraw message",
  [localeKeys.regularWithdrawMessage]: "Regular withdraw message",
  [localeKeys.depositAmountValueFormatError]: "Amount value must be a valid number",
  [localeKeys.somethingWrongHappened]: "Something wrong happened",
  [localeKeys.operationSuccessful]: "Operation successful",
  [localeKeys.noActiveDeposits]: "No active deposits",
  [localeKeys.amountGreaterThanRingBalance]: `You can't stake more than your available {{ringSymbol}} balance`,
  [localeKeys.amountGreaterThanKtonBalance]: `You can't stake more than your available {{ktonSymbol}} balance`,
  [localeKeys.leaveSomeGasFeeRing]: `You should leave at least {{amount}} {{ringSymbol}} for gas fee`,
  [localeKeys.invalidRingAmount]: "invalid {{ringSymbol}} amount",
  [localeKeys.invalidKtonAmount]: "invalid {{ktonSymbol}} amount",
  [localeKeys.invalidCommission]: "Invalid commission",
  [localeKeys.commissionOutOfRange]: "Commission value out of range",
  [localeKeys.noCollators]: "No collators",
  [localeKeys.chooseCollator]: "Choose collator",
  [localeKeys.setSessionKey]: "Set session key",
  [localeKeys.setCommission]: "Set commission",
  [localeKeys.invalidSessionKey]: "Invalid session key",
  [localeKeys.manageCollator]: "Manage collator",
  [localeKeys.stopCollatingInfo]: `Collators maintain parachains by collecting parachain transactions from users and producing state transition proofs for Relay Chain validators. Sure to stop collation now?`,
  [localeKeys.noDepositsToUnbond]: "No deposits to unbond",
  [localeKeys.noMoreDepositsToBond]: "No more deposits to bond",
  [localeKeys.switchChain]: "Switch chain",
  [localeKeys.switchChainInfo]: `You can choose the Chain in which you want to participate in Staking or deposit here.`,
  [localeKeys.bondedTokens]: "Bonded tokens",
  [localeKeys.bondedTokensInfo]: `Here are the tokens you’ve bonded in Staking. Note that the power is not working yet, you need to delegate the tokens to a collator to complete the staking process.`,
  [localeKeys.next]: "Next",
  [localeKeys.gotIt]: "Got it!",
  [localeKeys.selectCollatorInfo]: "You can Select A Collator to delegate your bonded tokens to.",
  [localeKeys.unbondAllInfo]: `<div>In case you want to quit the Staking, you can unbond all your bonded tokens here. Note that it takes 14 days to unbond all tokens and then it will have to be manually executed to make those tokens transferrable.</div><div style="margin-top: 10px;">Remember to come back here to execute the unbonding then.</div>`,
  [localeKeys.bondedAmount]: `Bonded: {{amount}}`,
  [localeKeys.depositAmountError]: `Deposit amount can't be lower than {{amount}} {{ringSymbol}}`,
};

export default enUs;
