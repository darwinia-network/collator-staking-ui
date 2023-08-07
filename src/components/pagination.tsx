import Image from "next/image";

interface Props {
  total: number;
  currentPage: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

function createPageOptions(totalPages: number, currentPage: number, onPageChange: (page: number) => void) {
  const pageNumbers = new Array(totalPages).fill(0).map((_, index) => index);

  if (currentPage < 3 || totalPages - 4 < currentPage) {
    // 0, 1, 2 or totalPages - 3, totalPages - 2, totalPages - 1

    if (totalPages > 8) {
      // 0, 1, 2, 3, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1
      return (
        <>
          {pageNumbers.slice(0, 4).map((p) => (
            <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onPageChange(p)} />
          ))}
          <PageButton page="more" />
          {pageNumbers.slice(-4).map((p) => (
            <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onPageChange(p)} />
          ))}
        </>
      );
    } else {
      return pageNumbers
        .slice(0, totalPages)
        .map((p) => <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onPageChange(p)} />);
    }
  } else {
    // 0, ..., currentPage - 1, currentPage, currentPage + 1, ..., totalPages - 1
    return (
      <>
        <PageButton page={0} currentPage={currentPage} onClick={() => onPageChange(0)} />
        <PageButton page="more" />
        {pageNumbers.slice(currentPage - 1, currentPage + 2).map((p) => (
          <PageButton key={p} page={p} currentPage={currentPage} onClick={() => onPageChange(p)} />
        ))}
        <PageButton page="more" />
        <PageButton page={totalPages - 1} currentPage={currentPage} onClick={() => onPageChange(totalPages - 1)} />
      </>
    );
  }
}

export default function Pagination({ total, currentPage, pageSize = 10, onPageChange = () => undefined }: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    totalPages > 1 && (
      <div className="flex items-center justify-end gap-small">
        <PageButton page="previous" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)} />
        {createPageOptions(totalPages, currentPage, onPageChange)}
        <PageButton
          page="next"
          disabled={currentPage === totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    )
  );
}

function PageButton({
  page,
  disabled,
  currentPage,
  onClick,
}: {
  page: number | "previous" | "next" | "more";
  disabled?: boolean;
  currentPage?: number;
  onClick?: () => void;
}) {
  return (
    <button
      className={`inline-flex h-8 w-8 items-center justify-center bg-app-black text-sm font-light transition disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60 ${
        page === currentPage || page === "previous" || page === "next" ? "text-white" : "text-white/50"
      } ${page === "more" || page === currentPage ? "hover:cursor-default" : "hover:scale-105 active:scale-95"}`}
      onClick={onClick}
      disabled={disabled}
    >
      {page === "more" ? (
        <span>...</span>
      ) : page === "previous" ? (
        <Image alt="Previous" width={16} height={16} src="/images/pagination/previous-page.svg" />
      ) : page === "next" ? (
        <Image alt="Next" width={16} height={16} src="/images/pagination/next-page.svg" />
      ) : (
        <span>{page + 1}</span>
      )}
    </button>
  );
}
