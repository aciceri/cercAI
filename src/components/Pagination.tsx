import { PaginationData } from "../types";
import "./Pagination.css";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

function Pagination({
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
}: PaginationProps) {
  const { currentPage, hasPreviousPage, hasNextPage } = pagination;

  // Generate page numbers to show (current page ± 2)
  const generatePageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = currentPage + 2;

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="pagination">
      <div className="pagination-info">Page {currentPage}</div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          disabled={!hasPreviousPage}
          onClick={onPreviousPage}
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {currentPage > 3 && (
            <>
              <button
                className="pagination-number"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              {currentPage > 4 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              className={`pagination-number ${pageNum === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <span className="pagination-ellipsis">...</span>
        </div>

        <button
          className="pagination-button"
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;
