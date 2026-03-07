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
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-surface-300 text-surface-500 hover:bg-surface-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-surface-400 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-brand-600 text-white'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-surface-300 text-surface-500 hover:bg-surface-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
