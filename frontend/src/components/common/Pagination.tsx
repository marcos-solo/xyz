import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  total,
  onPageChange,
}) => {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3 text-xs text-slate-500">
      <div>
        {total !== undefined && <span>Showing page {currentPage} of {lastPage} ({total} total)</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: lastPage }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
          .map((page, idx, array) => {
            const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition ${
                    currentPage === page
                      ? 'bg-[#73111b] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
