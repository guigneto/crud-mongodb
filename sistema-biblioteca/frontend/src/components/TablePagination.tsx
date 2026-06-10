import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface TablePaginationProps {
  page: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  setPage: (val: number | ((p: number) => number)) => void
}

export default function TablePagination({ page, totalPages, itemsPerPage, setItemsPerPage, setPage }: TablePaginationProps) {
  // Prevent page from going out of bounds if totalPages is 0
  const safeTotalPages = Math.max(1, totalPages)
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-end px-4 py-3 border-t border-gray-200 bg-white gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <span>Linhas por página:</span>
        <select
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
          className="border border-gray-200 rounded-md text-sm focus:ring-gray-200 focus:border-gray-300 py-1 pl-2 pr-6 bg-transparent cursor-pointer outline-none transition-colors hover:border-gray-300"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="text-sm text-gray-600 font-medium">
        Página {page} de {safeTotalPages}
      </div>

      <div className="flex items-center gap-1.5">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(1)} 
          className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Primeira página"
        >
          <ChevronsLeft size={18} />
        </button>
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)} 
          className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          disabled={page === safeTotalPages} 
          onClick={() => setPage(p => p + 1)} 
          className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Próxima página"
        >
          <ChevronRight size={18} />
        </button>
        <button 
          disabled={page === safeTotalPages} 
          onClick={() => setPage(safeTotalPages)} 
          className="p-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Última página"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  )
}
