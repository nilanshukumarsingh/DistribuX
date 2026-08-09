import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationType } from '../../types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6 rounded-b-2xl">
      <div className="hidden sm:block">
        <p className="text-xs font-medium text-zinc-400">
          Showing <span className="font-bold text-white">{start}</span> to{' '}
          <span className="font-bold text-white">{end}</span> of{' '}
          <span className="font-bold text-cyan-400">{total}</span> results
        </p>
      </div>

      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center px-3 py-1.5 border border-zinc-800 text-xs font-semibold rounded-xl text-zinc-300 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-zinc-300 sm:hidden">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center px-3 py-1.5 border border-zinc-800 text-xs font-semibold rounded-xl text-zinc-300 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
