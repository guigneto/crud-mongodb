import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export type SelectOption = { value: string; label: string }

interface MultiSelectProps {
  value: string[]
  onChange: (val: string[]) => void
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'warm'
  className?: string
  allowCustom?: boolean
}

export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  variant = 'default',
  className,
  allowCustom = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const isWarm = variant === 'warm';

  const handleToggle = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  // Generate the display label based on selected items
  let displayLabel = placeholder
  if (value.length > 0) {
    const selectedLabels = value.map(v => options.find(o => o.value === v)?.label || v)
    displayLabel = selectedLabels.join(', ')
  }

  const filteredOptions = allowCustom && search 
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) 
    : options

  const showCreate = allowCustom && search.trim().length > 0 && !options.some(o => o.label.toLowerCase() === search.trim().toLowerCase())

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={className || `w-full border rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
          isWarm 
            ? 'border-warm-300 bg-warm-50/30 hover:bg-warm-50/70 focus-within:ring-2 focus-within:ring-warm-400' 
            : 'border-gray-300 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`truncate ${value.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{displayLabel}</span>
          {value.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
              {value.length}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className={`absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg flex flex-col p-1 animate-fadeIn max-h-64 ${
          isWarm ? 'border-warm-200' : 'border-gray-200'
        }`}>
          {allowCustom && (
            <div className="p-2 border-b border-gray-100 mb-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar ou criar nova..."
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-60 space-y-0.5">
            {showCreate && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  if (!value.includes(search.trim())) {
                    onChange([...value, search.trim()])
                  }
                  setSearch('')
                }}
                className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center gap-2 text-blue-600 hover:bg-blue-50 font-medium`}
              >
                + Criar "{search.trim()}"
              </div>
            )}
            {filteredOptions.map((o) => {
              const isSelected = value.includes(o.value)
              return (
                <div
                  key={o.value}
                  onClick={(e) => handleToggle(o.value, e)}
                  className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center gap-2 ${
                    isSelected
                      ? isWarm ? 'bg-warm-50 text-warm-900' : 'bg-blue-50/50 text-blue-900'
                      : isWarm ? 'text-gray-700 hover:bg-warm-50' : 'text-gray-700 hover:bg-gray-100'
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
