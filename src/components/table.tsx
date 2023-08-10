import Image from "next/image";
import { CSSProperties, Fragment, Key, ReactElement, useRef } from "react";
import Pagination from "./pagination";
import CountLoading from "./count-loading";
import { CSSTransition } from "react-transition-group";

export interface ColumnType<T> {
  title: ReactElement;
  key: Key;
  dataIndex: keyof T;
  width?: string | number;
  render?: (row: T) => ReactElement;
}

interface Props<T> {
  dataSource: T[];
  columns: ColumnType<T>[];
  styles?: CSSProperties;
  contentClassName?: string;
  selectedItem?: Key;
  total?: number;
  pageSize?: number;
  currentPage?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onRowSelect?: (key: Key) => void;
}

export default function Table<T extends { key: Key }>({
  columns,
  dataSource,
  styles,
  contentClassName,
  selectedItem,
  total,
  pageSize,
  currentPage,
  loading,
  onPageChange,
  onRowSelect,
}: Props<T>) {
  const loadingRef = useRef<HTMLDivElement>(null);

  const templateCols = columns.reduce((acc, cur) => {
    const width = typeof cur.width === "string" ? cur.width : typeof cur.width === "number" ? `${cur.width}px` : "1fr";
    if (acc === "auto") {
      acc = width;
    } else {
      acc = `${acc} ${width}`;
    }
    return acc;
  }, "auto");

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="w-full min-w-[872px]" style={styles}>
        {/* table header */}
        <div
          className="grid items-center gap-middle bg-app-black px-middle py-large text-xs font-bold text-white"
          style={{ gridTemplateColumns: templateCols }}
        >
          {columns.map(({ key, title }) => (
            <Fragment key={key}>{title}</Fragment>
          ))}
        </div>
        {/* table body */}
        <div className="relative">
          {/* loading */}
          <CSSTransition
            in={loading}
            nodeRef={loadingRef}
            timeout={300}
            classNames="component-loading"
            unmountOnExit
            appear
          >
            <div
              ref={loadingRef}
              className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center"
            >
              <CountLoading size="large" />
            </div>
          </CSSTransition>

          {dataSource.length ? (
            <div>
              {/* content */}
              <div className={`overflow-y-auto ${contentClassName}`}>
                <div>
                  {dataSource.map((row) => (
                    <div
                      key={row.key}
                      className={`grid items-center gap-middle border-b border-b-white/20 px-middle py-middle text-sm font-light text-white transition last:border-b-0 ${
                        onRowSelect ? "hover:cursor-pointer hover:opacity-80" : ""
                      } ${selectedItem === row.key ? "bg-primary" : ""}`}
                      style={{ gridTemplateColumns: templateCols }}
                      onClick={() => {
                        if (onRowSelect) {
                          onRowSelect(row.key);
                        }
                      }}
                    >
                      {columns.map(({ key, dataIndex, render }) => (
                        <Fragment key={key}>
                          {render ? render(row) : <span className="truncate">{row[dataIndex]}</span>}
                        </Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* pagination */}
              {total !== undefined && currentPage !== undefined && (
                <Pagination total={total} pageSize={pageSize} currentPage={currentPage} onPageChange={onPageChange} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-large py-10">
              {!loading && (
                <>
                  <Image width={50} height={63} alt="Table no data" src="/images/no-data.svg" />
                  <span className="text-sm font-light text-white/50">No data</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
