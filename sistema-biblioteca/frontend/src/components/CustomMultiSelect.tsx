import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export type SelectOption = { value: string; label: string }

interface CustomMultiSelectProps {
  values: string[]
  onChange: (vals: string[]) => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  creatable?: boolean
  onCreate?: (val: string) => Promise<string | undefined>
  className?: string
}

export default function CustomMultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Selecione...',
  searchable = false,
  searchPlaceholder = 'Pesquisar...',
  creatable = false,
  onCreate,
  className,
}: CustomMultiSelectProps) {
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

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredOptions = options.filter((o) =>
    normalize(o.label).includes(normalize(searchTerm))
  )

  const selectedOptions = values.map(v => options.find(o => o.value === v)).filter(Boolean) as SelectOption[]

  function toggleOption(val: string) {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  function removeOption(e: React.MouseEvent, val: string) {
    e.stopPropagation()
    onChange(values.filter(v => v !== val))
  }

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={className || `w-full border rounded-lg px-2 py-1.5 min-h-[42px] text-sm cursor-pointer flex flex-wrap gap-1 items-center transition-colors border-gray-300 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-400 px-1 py-1">{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span key={opt.value} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-200">
              {opt.label}
              <button type="button" onClick={(e) => removeOption(e, opt.value)} className="hover:text-blue-900 focus:outline-none">
                <X size={12} />
              </button>
            </span>
          ))
        )}
        <div className="flex-1 min-w-[2px]"></div>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ml-1 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col p-1 animate-fadeIn max-h-64">
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
            <>
              {filteredOptions.length === 0 && !creatable && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">Nenhum resultado encontrado</div>
                )}
                {filteredOptions.map((o) => {
                  const isSelected = values.includes(o.value)
                  return (
                    <div
                      key={o.value}
                      onClick={() => toggleOption(o.value)}
                      className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {o.label}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    </div>
                  )
                })}
                {creatable && searchTerm.trim() && !filteredOptions.some(o => normalize(o.label) === normalize(searchTerm)) && (
                  <div
                    onClick={async () => {
                      if (onCreate) {
                        const newVal = await onCreate(searchTerm.trim());
                        if (newVal) {
                          toggleOption(newVal);
                        }
                      }
                    }}
                    className="px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                  >
                    <span className="text-xl leading-none">+</span> Adicionar "{searchTerm.trim()}"
                  </div>
                )}
              </>
          </div>
        </div>
      )}
    </div>
  )
}
