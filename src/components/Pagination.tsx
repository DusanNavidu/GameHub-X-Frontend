import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"; // 🟢 MoreHorizontal අලුතෙන් ගත්තා '...' පෙන්නන්න

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null; // පිටු 1 කට වඩා නැත්නම් මේක පෙන්වන්නේ නෑ

  // 🟢 ලස්සනට Pages අංක ටික හදාගන්න Logic එක
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // පිටු 7යි හෝ ඊට අඩුයි නම් ඔක්කොම පෙන්නනවා
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // පිටු ගොඩක් තියෙනවා නම්...
      if (currentPage <= 4) {
        // මුල් හරියේ ඉන්නවා නම්
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        // අන්තිම හරියේ ඉන්නවා නම්
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // මැද හරියේ ඉන්නවා නම්
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center md:justify-between mt-6 bg-black/40 border border-white/5 p-3 rounded-xl backdrop-blur-sm">
      
      {/* Desktop view එකේ විතරක් Page ගාණ අකුරෙන් පෙන්නනවා */}
      <div className="hidden md:block text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
        Page <span className="text-green-500">{currentPage}</span> of {totalPages}
      </div>

      {/* Mobile එකටත් ගැලපෙන්න gap අඩු වැඩි කරලා තියෙන්නේ */}
      <div className="flex items-center gap-1 sm:gap-2">
        
        {/* Prev Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-white/5 transition-colors border border-white/5"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((page, index) => {
            // '...' ආවොත් Button එකක් නෙවෙයි නිකන් Icon එකක් පෙන්නනවා
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className="w-5 sm:w-8 h-8 flex items-center justify-center text-gray-600">
                  <MoreHorizontal size={14} />
                </div>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg text-xs font-black font-mono transition-all duration-300 ${
                  currentPage === pageNum
                    ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-110"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-gray-400 hover:text-green-500 hover:bg-white/10 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-white/5 transition-colors border border-white/5"
        >
          <ChevronRight size={16} />
        </button>
        
      </div>
    </div>
  );
}