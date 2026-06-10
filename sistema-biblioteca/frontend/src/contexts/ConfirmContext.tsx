import { createContext, useState, useContext, type ReactNode } from 'react'
import Modal from '../components/Modal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  onConfirm: () => void | Promise<void>
}

interface ConfirmContextData {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextData>({} as ConfirmContextData)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!options) return
    setLoading(true)
    try {
      await options.onConfirm()
    } finally {
      setLoading(false)
      setOptions(null)
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm: setOptions }}>
      {children}
      <Modal open={!!options} onClose={() => !loading && setOptions(null)} title={options?.title || 'Confirmação'} maxWidth="max-w-md">
        <div className="p-2">
          <p className="text-gray-600 mb-6 text-justify">{options?.message}</p>
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <button 
              disabled={loading}
              onClick={() => setOptions(null)} 
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              disabled={loading}
              onClick={handleConfirm} 
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Aguarde...' : (options?.confirmText || 'Confirmar')}
            </button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
