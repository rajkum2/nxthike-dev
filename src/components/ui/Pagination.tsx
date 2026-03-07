import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center mt-10">
      <nav className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-surface-200 bg-white text-surface-500 hover:bg-surface-50 hover:text-surface-700 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'string' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-surface-400 text-sm select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center justify-center h-9 w-9 rounded-md text-sm transition-all duration-200 ${
                currentPage === page
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900 shadow-sm font-medium'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-surface-200 bg-white text-surface-500 hover:bg-surface-50 hover:text-surface-700 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
