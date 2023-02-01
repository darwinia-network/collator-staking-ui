import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Button, Column, Input, ModalEnhanced, notification, Tab, Table, Tabs } from "@darwinia/ui";
import { localeKeys, useAppTranslation } from "@darwinia/app-locale";
import { Collator } from "@darwinia/app-types";
import JazzIcon from "../JazzIcon";
import copyIcon from "../../assets/images/copy.svg";
import { copyToClipboard, formatToWei, isValidNumber, prettifyNumber } from "@darwinia/app-utils";
import { useStorage, useWallet } from "@darwinia/app-providers";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { TransactionResponse } from "@ethersproject/providers";

export interface SelectCollatorRefs {
  toggle: () => void;
}

interface SelectCollatorProps {
  type: "set" | "update";
  onCollatorSelected: (collator: Collator) => void;
  selectedCollator?: Collator;
}

const SelectCollatorModal = forwardRef<SelectCollatorRefs, SelectCollatorProps>(
  ({ type, selectedCollator, onCollatorSelected }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeTabId, setActiveTabId] = useState<string>("1");
    const [keywords, setKeywords] = useState<string>("");
    const [selectedRowsIds, setSelectedRowsIds] = useState<string[]>([]);
    const selectedCollatorsList = useRef<Collator[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const updatedCollator = useRef<Collator>();
    const { t } = useAppTranslation();
    const { collators } = useStorage();
    const { stakingContract } = useWallet();

    useEffect(() => {
      if (selectedCollator) {
        selectedCollatorsList.current = [{ ...selectedCollator }];
      }
    }, [selectedCollator]);

    const tabs: Tab[] = [
      {
        id: "1",
        title: t(localeKeys.activePool),
      },
      {
        id: "2",
        title: t(localeKeys.waitingPool),
      },
    ];

    const visibleCollators = useMemo(() => {
      if (activeTabId !== "1" && activeTabId !== "2") {
        return [];
      }
      const isActive = activeTabId === "1";
      let filteredCollators: Collator[] = [];
      if (isActive) {
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
    }, [activeTabId, keywords, collators]);

    useEffect(() => {
      if (activeTabId === "1" || activeTabId === "2") {
        setKeywords("");
      }
    }, [activeTabId]);

    const onCopyCollator = (item: Collator) => {
      copyToClipboard(item.accountAddress);
      console.log(item);
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
          return (
            <div>
              {prettifyNumber({
                number: row.totalStaked,
                shouldFormatToEther: false,
                precision: 0,
              })}
            </div>
          );
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
      setActiveTabId("1");
      setLoading(false);
      updatedCollator.current = undefined;
      setIsVisible((oldStatus) => !oldStatus);
    };

    const onClose = () => {
      setIsVisible(false);
    };

    const onTabChange = (selectedTab: Tab) => {
      setActiveTabId(selectedTab.id);
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
        setLoading(false);
        notification.error({
          message: <div>{t(localeKeys.somethingWrongHappened)}</div>,
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
        isCancellable={false}
        isLoading={isLoading}
      >
        <div>
          <Tabs onChange={onTabChange} tabs={tabs} activeTabId={activeTabId} />
          {/*Tabs content*/}
          {(activeTabId === "1" || activeTabId === "2") && (
            <div className={"flex flex-col gap-[10px] pt-[10px]"}>
              <div className={"flex flex-col lg:flex-row gap-[10px] lg:gap-[5px] lg:items-center"}>
                <div className={"flex-1 text-halfWhite text-12"}>
                  {activeTabId === "1" ? t(localeKeys.activePoolInfo) : ""}
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
          )}
        </div>
      </ModalEnhanced>
    );
  }
);

SelectCollatorModal.displayName = "SelectCollator";

export default SelectCollatorModal;
