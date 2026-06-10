import { useEffect, useRef, useState } from 'react'
import { Filter, Check } from 'lucide-react'

export type ColumnMultiFilterOption = { value: string; label: string }

interface ColumnMultiFilterProps {
  title: string
  value: string[]
  onChange: (val: string[]) => void
  options: ColumnMultiFilterOption[]
}

export default function ColumnMultiFilter({
  title,
  value,
  onChange,
  options,
}: ColumnMultiFilterProps) {
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

  const isActive = value.length > 0

  const handleToggle = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div className="relative inline-flex items-center gap-1.5 group" ref={ref}>
      <span>{title}</span>
      <button
        onClick={() => setOpen(!open)}
        className={`p-1 rounded transition-colors flex items-center gap-1 ${
          isActive 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title={`Filtrar ${title}`}
      >
        <Filter size={14} className={isActive ? 'fill-blue-100' : ''} />
        {isActive && <span className="text-[10px] font-bold leading-none">{value.length}</span>}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 font-normal text-left">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1 flex justify-between items-center">
            <span>Filtrar {title}</span>
            {isActive && (
              <span onClick={handleClear} className="text-blue-600 hover:underline cursor-pointer lowercase normal-case">Limpar</span>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {options.map((o) => {
              const isSelected = value.includes(o.value)
              return (
                <div
                  key={o.value}
                  onClick={(e) => handleToggle(o.value, e)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-50/50 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className={isSelected ? 'font-medium' : ''}>{o.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
