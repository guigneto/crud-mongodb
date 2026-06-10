import { useEffect, useRef, useState } from 'react'
import { Filter } from 'lucide-react'

export type ColumnFilterOption = { value: string; label: string }

interface ColumnFilterProps {
  title: string
  value: string
  onChange: (val: string) => void
  options: ColumnFilterOption[]
  defaultOption?: string
}

export default function ColumnFilter({
  title,
  value,
  onChange,
  options,
  defaultOption = 'todos'
}: ColumnFilterProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = value !== defaultOption

  return (
    <div className="relative inline-flex items-center gap-1.5 group" ref={ref}>
      <span>{title}</span>
      <button
        onClick={() => setOpen(!open)}
        className={`p-1 rounded transition-colors ${
          isActive 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title={`Filtrar ${title}`}
      >
        <Filter size={14} className={isActive ? 'fill-blue-100' : ''} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 font-normal text-left">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
            Filtrar {title}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === o.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
