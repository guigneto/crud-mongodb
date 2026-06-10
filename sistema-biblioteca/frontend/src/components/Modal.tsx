import { X, ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  overflowVisible?: boolean
  onBack?: () => void
  actions?: ReactNode
}

export default function Modal({ open, onClose, onBack, actions, title, children, maxWidth = 'max-w-lg', overflowVisible = false }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${maxWidth} ${overflowVisible ? 'overflow-visible' : 'max-h-[90vh] overflow-y-auto'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded -ml-2" title="Voltar">
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {actions && (
              <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-200">
                {actions}
              </div>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded -mr-2" title="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
