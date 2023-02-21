import sortDefaultIcon from "../../assets/images/sort-default.svg";
import sortAscendIcon from "../../assets/images/sort-ascend.svg";
import sortDescendIcon from "../../assets/images/sort-descend.svg";
import noData from "../../assets/images/no-data.svg";
import { useState } from "react";
import "./styles.scss";
import Pagination, { PaginationProps } from "../Pagination";
import Spinner from "../Spinner";

export type Order = "ascend" | "descend";
export interface Column<T> {
  id: string | number;
  title: JSX.Element;
  key: keyof T;
  width?: string;
  render?: (row: T) => JSX.Element;
  sortable?: boolean;
}

export interface SortEvent<T> {
  order: Order | undefined;
  key: keyof T;
}

export interface TableProps<T> {
  dataSource: T[];
  columns: Column<T>[];
  minWidth?: string;
  maxHeight?: string;
  onSort?: (sortEvent: SortEvent<T>) => void;
  headerSlot?: JSX.Element;
  footerSlot?: JSX.Element;
  pagination?: PaginationProps;
  noDataText?: string;
  isLoading?: boolean;
  spinnerText?: string;
  className?: string;
  selectedRowsIds?: string[] | number[];
  selectedRowClass?: string;
  onRowClick?: (row: T) => void;
}

export interface TableRow extends Object {
  id: string | number;
}

/**
 * IMPORTANT: Each dataSource object MUST contain an id in form of string format
 */

const Table = <T extends TableRow>({
  className = "",
  dataSource = [],
  columns = [],
  onSort: onTableSort,
  minWidth = "1100px",
  maxHeight,
  headerSlot,
  footerSlot,
  pagination,
  noDataText,
  isLoading = false,
  spinnerText,
  selectedRowsIds = [],
  selectedRowClass = "",
  onRowClick,
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | undefined>();
  const [sortOrder, setSortOrder] = useState<Order | undefined>();
  const defaultSortOrder: Order = "ascend";
  const onSort = (key: keyof T) => {
    if (sortKey !== key) {
      /*start afresh sorting with this column*/
      setSortOrder(defaultSortOrder);
      setSortKey(key);
      if (onTableSort) {
        onTableSort({ order: defaultSortOrder, key: key });
      }
      return;
    }
    /*The user is changing sort order on the same column*/
    const nextSortOrder: Order = sortOrder === "ascend" ? "descend" : "ascend";
    setSortOrder(nextSortOrder);
    if (onTableSort) {
      onTableSort({ order: nextSortOrder, key: key });
    }
  };
  return (
    <Spinner spinnerText={spinnerText} isLoading={isLoading}>
      <div className={`dw-table ${className}`}>
        {headerSlot}
        <div className={"dw-table-scrollview dw-custom-scrollbar"}>
          <div style={{ minWidth: minWidth, maxHeight: maxHeight }}>
            {/*Table header*/}
            <div className={"dw-table-header"}>
              {columns.map((column) => {
                return getColumn({
                  isHeader: true,
                  column,
                  onSort,
                  sortKey,
                  sortOrder,
                });
              })}
            </div>
            {/*Empty table*/}
            {dataSource.length === 0 && (
              <div className={"dw-table-empty"}>
                <img className={"dw-empty-icon"} src={noData} alt="image" />
                <div>{noDataText ? noDataText : "no data"}</div>
              </div>
            )}
            {/*Table body*/}
            <div className={"dw-table-body"}>
              {dataSource.map((row, index) => {
                const rowKey = row.id ?? index;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const isRowSelected = selectedRowsIds?.includes(row.id);
                const rowClass = isRowSelected ? selectedRowClass : "";
                return (
                  <div
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row);
                      }
                    }}
                    className={`dw-table-row ${rowClass}`}
                    key={rowKey}
                  >
                    {columns.map((column) => {
                      return getColumn({
                        isHeader: false,
                        column,
                        row,
                        sortKey,
                        sortOrder,
                      });
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {pagination && dataSource.length > 0 && (
          <div className={"dw-table-pagination"}>
            <Pagination {...pagination} />
          </div>
        )}
        {footerSlot}
      </div>
    </Spinner>
  );
};

const getColumn = <T extends object>({
  column,
  isHeader = false,
  onSort,
  row,
  sortOrder,
  sortKey,
}: {
  column: Column<T>;
  isHeader?: boolean;
  onSort?: (sortKey: keyof T) => void;
  row?: T;
  sortKey: keyof T | undefined;
  sortOrder: Order | undefined;
}) => {
  let value = "";
  if (row) {
    value = typeof row[column.key] === "string" ? `${row[column.key]}` : JSON.stringify(row[column.key]);
  }
  const hasCustomWidth = column.width && column.width !== "";
  const customWidth = hasCustomWidth ? { width: column.width } : {};
  const columnFlexClass = hasCustomWidth ? "" : "flexed";
  const customRender = column.render ? (row ? column.render(row) : null) : undefined;
  const columnRender = column.render ? customRender : value;
  const isSortingThisColumn = sortKey === column.key;
  const orderIcon = sortOrder === "ascend" ? sortAscendIcon : sortDescendIcon;
  const sortIcon = isSortingThisColumn ? orderIcon : sortDefaultIcon;
  const isSortable = column.sortable;

  return (
    <div style={{ ...customWidth }} className={`${columnFlexClass} dw-table-column`} key={column.id}>
      <div className={"column-wrapper"}>
        <div className={"content"}>{isHeader ? column.title : columnRender}</div>
        {isHeader && isSortable && (
          <div
            onClick={() => {
              if (onSort) {
                onSort(column.key);
              }
            }}
            className={"sorter"}
          >
            <img className={"icon"} src={sortIcon} alt="image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
