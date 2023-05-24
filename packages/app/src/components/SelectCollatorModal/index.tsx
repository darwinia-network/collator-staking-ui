import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Button, Column, Input, ModalEnhanced, notification, Tab, Table, Tabs } from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "../../locale";
import { Collator, MetaMaskError } from "../../types";
import JazzIcon from "../JazzIcon";
import copyIcon from "../../assets/images/copy.svg";
import { copyToClipboard, getChainConfig, isEthersApi, prettifyNumber, processTransactionError } from "../../utils";
import { useStaking, useWallet } from "../../hooks";
import { TransactionResponse } from "@ethersproject/providers";
import { Contract } from "ethers";

export interface SelectCollatorRefs {
  toggle: () => void;
}

interface SelectCollatorProps {
  type: "set" | "update";
  onCollatorSelected: (collator: Collator) => void;
  selectedCollator?: Collator;
}

export const SelectCollatorModal = forwardRef<SelectCollatorRefs, SelectCollatorProps>(
  ({ type, selectedCollator, onCollatorSelected }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [keywords, setKeywords] = useState<string>("");
    const [selectedRowsIds, setSelectedRowsIds] = useState<string[]>([]);
    const selectedCollatorsList = useRef<Collator[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const updatedCollator = useRef<Collator>();
    const { t } = useAppTranslation();
    const { collators } = useStaking();
    const { currentChain, signerApi } = useWallet();

    const chainConfig = useMemo(() => {
      if (currentChain) {
        return getChainConfig(currentChain) ?? null;
      }
      return null;
    }, [currentChain]);

    const tabs = useMemo(
      () => [
        {
          id: "1",
          title: t(localeKeys.activePool),
        },
        {
          id: "2",
          title: t(localeKeys.waitingPool),
        },
      ],
      [t]
    );
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    useEffect(() => {
      if (selectedCollator) {
        selectedCollatorsList.current = [{ ...selectedCollator }];
      }
    }, [selectedCollator]);

    const visibleCollators = useMemo(() => {
      if (activeTab !== tabs[0].id && activeTab !== tabs[1].id) {
        return [];
      }

      let filteredCollators: Collator[] = [];
      if (activeTab === tabs[0].id) {
        filteredCollators =
          collators?.filter((item) => {
            return (
              item.isActive &&
              (item.accountAddress.toLowerCase().includes(keywords.toLowerCase()) ||
                item.accountName?.toLowerCase().includes(keywords.toLowerCase()))
            );
          }) ?? [];
      } else {
        filteredCollators =
          collators?.filter((item) => {
            return (
              !item.isActive &&
              (item.accountAddress.toLowerCase().includes(keywords.toLowerCase()) ||
                item.accountName?.toLowerCase().includes(keywords.toLowerCase()))
            );
          }) ?? [];
      }
      return filteredCollators;
    }, [activeTab, keywords, collators, tabs]);

    useEffect(() => {
      if (activeTab === tabs[0].id || activeTab === tabs[1].id) {
        setKeywords("");
      }
    }, [activeTab, tabs]);

    const onCopyCollator = (item: Collator) => {
      copyToClipboard(item.accountAddress);
    };

    const columns: Column<Collator>[] = [
      {
        id: "1",
        title: <div>{t(localeKeys.collator)}</div>,
        key: "accountAddress",
        render: (row) => {
          return (
            <div className={"flex gap-[5px] items-center flex-ellipsis"}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={"shrink-0"}
              >
                <JazzIcon size={20} address={row.accountAddress} />
              </div>
              <div className={"flex-1 cursor-default clickable"}>
                {row.accountName ? row.accountName : row.accountAddress}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyCollator(row);
                }}
                className={"shrink-0 clickable"}
              >
                <img className={"w-[16px]"} src={copyIcon} alt="copy" />
              </div>
            </div>
          );
        },
      },
      {
        id: "2",
        title: <div className={"w-[150px]"}>{t(localeKeys.totalStaked)}</div>,
        key: "totalStaked",
        render: (row) => {
          return <div>{prettifyNumber(row.totalStaked.toString())}</div>;
        },
        width: "190px",
      },
      {
        id: "3",
        title: <div>{t(localeKeys.commission)}</div>,
        key: "commission",
        render: (row) => {
          return <div>{row.commission}</div>;
        },
        width: "180px",
      },
      {
        id: "4",
        title: <div dangerouslySetInnerHTML={{ __html: t(localeKeys.blocksLastSession) }} />,
        key: "totalStaked",
        render: (row) => {
          return <div>{row.lastSessionBlocks}</div>;
        },
        width: "150px",
      },
    ];

    const toggleModal = () => {
      if (type === "update") {
        setSelectedRowsIds([]);
      }
      setActiveTab(tabs[0].id);
      setLoading(false);
      updatedCollator.current = undefined;
      setIsVisible((oldStatus) => !oldStatus);
    };

    const onClose = () => {
      setIsVisible(false);
    };

    const onTabChange = ({ id }: Tab) => {
      setActiveTab(id);
    };

    const onCollatorRowClick = (row: Collator) => {
      // currently, we only support selecting one collator
      selectedCollatorsList.current = [{ ...row }];
      setSelectedRowsIds([row.id]);
      if (type === "set") {
        /*if the dialog is opened in the set mode, close it immediately after the
         * user has picked the collator, if he is on the update mode, then the
         * dialog will be closed after the user has signed the transaction on MetaMask */
        onCollatorSelected(row);
        onClose();
        return;
      }

      /*The user is trying to update the collator, wait for him to click the confirm button by himself */
      updatedCollator.current = row;
    };

    const onConfirmCollator = async () => {
      if (!chainConfig || !isEthersApi(signerApi)) {
        return;
      }
      const stakingContract = new Contract(
        chainConfig.contractAddresses.staking,
        chainConfig.contractInterface.staking,
        signerApi.getSigner()
      );

      /*the user is trying to update the collator, call the contract API right away*/
      try {
        if (!updatedCollator.current) {
          return;
        }
        setLoading(true);
        const response = (await stakingContract?.nominate(
          updatedCollator.current.accountAddress
        )) as TransactionResponse;
        await response.wait(1);
        setLoading(false);
        onCollatorSelected(updatedCollator.current);
        onClose();
        notification.success({
          message: <div>{t(localeKeys.operationSuccessful)}</div>,
        });
      } catch (e) {
        const error = processTransactionError(e as MetaMaskError);
        setLoading(false);
        notification.error({
          message: <div>{error.message}</div>,
        });
        console.log(e);
      }
    };

    useImperativeHandle(ref, () => {
      return {
        toggle: toggleModal,
      };
    });

    return (
      <ModalEnhanced
        className={"!max-w-[790px]"}
        contentClassName={"h-[465px]"}
        onClose={onClose}
        modalTitle={t(localeKeys.selectCollator)}
        isVisible={isVisible}
        isLoading={isLoading}
      >
        <div>
          <Tabs onChange={onTabChange} tabs={tabs} activeTabId={activeTab} />
          {/*Tabs content*/}
          {activeTab === tabs[0].id || activeTab === tabs[1].id ? (
            <div className={"flex flex-col gap-[10px] pt-[10px]"}>
              <div className={"flex flex-col lg:flex-row gap-[10px] lg:gap-[5px] lg:items-center"}>
                <div className={"flex-1 text-halfWhite text-12"}>
                  {activeTab === tabs[0].id ? t(localeKeys.activePoolInfo) : ""}
                </div>
                <div className={"w-full lg:w-[205px]"}>
                  <Input
                    onChange={(e) => {
                      setKeywords(e.target.value);
                    }}
                    value={keywords}
                    className={"!h-[30px] text-12"}
                    placeholder={t(localeKeys.searchForCollator)}
                  />
                </div>
              </div>
              <Table
                noDataText={t(localeKeys.noCollators)}
                className={"!p-[0px]"}
                maxHeight={"300px"}
                minWidth={"700px"}
                dataSource={visibleCollators}
                columns={columns}
                selectedRowsIds={selectedRowsIds}
                selectedRowClass={"bg-primary"}
                onRowClick={onCollatorRowClick}
              />
              {type === "update" && (
                <div className={"flex gap-[10px]"}>
                  <Button disabled={!updatedCollator.current} onClick={onConfirmCollator}>
                    {t(localeKeys.confirm)}
                  </Button>
                  {/*<Button>{t(localeKeys.cancel)}</Button>*/}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </ModalEnhanced>
    );
  }
);

SelectCollatorModal.displayName = "SelectCollator";
