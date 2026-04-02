import React from "react";

export interface PaginationData {
  currentPage: number;
  pageSize:number;
  totalPages: number;
  totalRecords: number; 
}

interface PaginationProps {
  paginationData: PaginationData | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  paginationData,
  isLoading,
  onPageChange,
}) => {
  if (!paginationData) return null;

  const { currentPage, totalPages, totalRecords } = paginationData;

  if (totalPages < 1) return null;

  const pages: number[] = [];
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1) {
    endPage = Math.min(3, totalPages);
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
  }

  if (currentPage === totalPages - 1) {
    startPage = totalPages - 2;
    endPage = totalPages;
  }

  startPage = Math.max(1, startPage);
  endPage = Math.min(totalPages, endPage);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-lg text-gray-400">
        Total Records: <span className="font-semibold">{totalRecords}</span>
      </div>

   {totalPages <= 1? "":
     <div className="flex gap-2">
        <button
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-white hover:text-black disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((page) => (
          <button
            key={page}
            disabled={page === currentPage || isLoading}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white"
            } hover:bg-white hover:text-black disabled:opacity-50`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1 rounded bg-gray-700 text-white hover:bg-white hover:text-black disabled:opacity-50 ${
            currentPage === totalPages || isLoading ? "cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
       }
    </div>
  );
};

export default Pagination;
