import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type SelectOption = { value: string; label: string }

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  disabledPlaceholder?: string
  variant?: 'default' | 'warm'
  searchable?: boolean
  icon?: React.ReactNode
  searchPlaceholder?: string
  creatable?: boolean
  onCreate?: (val: string) => Promise<string | undefined>
  className?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  disabledPlaceholder = '',
  variant = 'default',
  searchable = false,
  icon,
  searchPlaceholder = 'Pesquisar...',
  creatable = false,
  onCreate,
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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

  useEffect(() => {
    if (!open) {
      setSearchTerm('')
    }
  }, [open])

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder
  const isWarm = variant === 'warm';

  // Accent-insensitive and case-insensitive filter
  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredOptions = options.filter((o) =>
    normalize(o.label).includes(normalize(searchTerm))
  )

  if (disabled) {
    return (
      <div className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed opacity-60 flex justify-between items-center ${
        isWarm ? 'border-warm-200 bg-warm-50 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-400'
      }`}>
        <span>{disabledPlaceholder || placeholder}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    )
  }

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
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>{selectedLabel}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className={`absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg flex flex-col p-1 animate-fadeIn max-h-64 ${
          isWarm ? 'border-warm-200' : 'border-gray-200'
        }`}>
          {searchable && (
            <div className="p-1 mb-1 bg-white border-b border-gray-100">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-48 space-y-0.5">
            {searchable && !searchTerm.trim() ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">Digite para buscar...</div>
            ) : (
              <>
                {filteredOptions.length === 0 && !creatable && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">Nenhum resultado encontrado</div>
                )}
                {filteredOptions.map((o) => (
                  <div
                    key={o.value}
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors ${
                      value === o.value
                        ? isWarm ? 'bg-warm-100 text-warm-850 font-medium' : 'bg-blue-50 text-blue-700 font-medium'
                        : isWarm ? 'text-gray-700 hover:bg-warm-50' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {o.label}
                  </div>
                ))}
                {creatable && searchTerm.trim() && !filteredOptions.some(o => normalize(o.label) === normalize(searchTerm)) && (
                  <div
                    onClick={async () => {
                      if (onCreate) {
                        const newVal = await onCreate(searchTerm.trim());
                        if (newVal) {
                          onChange(newVal);
                          setOpen(false);
                        }
                      }
                    }}
                    className="px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                  >
                    <span className="text-xl leading-none">+</span> Adicionar "{searchTerm.trim()}"
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
