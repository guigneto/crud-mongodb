import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
  variant?: 'default' | 'warm'
}

export default function SearchBar({ placeholder = 'Buscar…', onSearch, debounceMs = 300, variant = 'default' }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), debounceMs)
    return () => clearTimeout(t)
  }, [value, debounceMs, onSearch])

  const isWarm = variant === 'warm';

  return (
    <div className="relative">
      <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
        isWarm ? 'text-warm-500' : 'text-gray-400'
      }`} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-[14px] pl-10 pr-9 py-3 text-sm focus:outline-none transition-all ${
          isWarm 
            ? 'bg-warm-50/20 text-gray-900 placeholder-gray-400/80 focus:ring-2 focus:ring-warm-400' 
            : 'bg-gray-100 border-none text-gray-900 placeholder-gray-400 focus:bg-gray-200'
        }`}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
