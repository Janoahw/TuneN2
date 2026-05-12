interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (page) =>
      page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-[#1A1A1E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1A1A1E] text-[#8E8E93]"
      >
        Previous
      </button>

      {visiblePages.map((page, idx) => {
        const prevPage = visiblePages[idx - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-2">...</span>}
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? 'bg-[#00CCCC] text-white'
                  : 'border border-[#1A1A1E] hover:bg-[#1A1A1E] text-[#8E8E93]'
              }`}
            >
              {page}
            </button>
          </div>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-[#1A1A1E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1A1A1E] text-[#8E8E93]"
      >
        Next
      </button>
    </div>
  );
}
