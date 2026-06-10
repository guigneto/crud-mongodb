import { useCallback, useEffect, useState, useMemo } from 'react'
import { Building2 } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Editora, getEditoras, createEditora, updateEditora, deleteEditora } from '../services/editoras.service'

type Form = { dscEditora: string }

export default function Editoras() {
  const [data, setData]         = useState<Editora[]>([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Editora | undefined>()
  const [query, setQuery]       = useState('')
  const [page, setPage]         = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getEditoras(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    return data.filter((e) => e.dscEditora.toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(e: Editora) { setEditing(e); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteEditora(id); load()
  }

  async function handleSubmit(form: Form) {
    if (editing) await updateEditora(editing._id!, form)
    else await createEditora(form)
    close(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editoras</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as editoras parceiras</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Building2 size={16} /> Nova Editora
        </button>
      </div>

      <div className="mb-6 w-full">
        <SearchBar placeholder="Buscar por nome…" onSearch={setQuery} />
      </div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhuma editora cadastrada.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><th className="px-4 py-3 font-medium">Descrição</th><th className="px-4 py-3 font-medium text-right">Ações</th></tr></thead>
            <tbody>
              {paginated.map((e) => (
                <tr key={e._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.dscEditora}</td>
                  <td className="px-4 py-3"><TableActions onEdit={() => openEdit(e)} onDelete={() => handleDelete(e._id!)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> de <span className="font-medium">{filtered.length}</span>
              </div>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700 transition-colors">Anterior</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700 transition-colors">Próxima</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={open} onClose={close} title={editing ? 'Editar Editora' : 'Nova Editora'}>
        <EditoraForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function EditoraForm({ initial, onSubmit, onCancel }: { initial?: Editora; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [dscEditora, setDsc] = useState(initial?.dscEditora ?? '')
  const [saving, setSaving]  = useState(false)
  const [error, setError]    = useState('')

  useEffect(() => { setDsc(initial?.dscEditora ?? ''); setError('') }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!dscEditora.trim()) { setError('Descrição é obrigatória.'); return }
    setSaving(true); setError('')
    try { await onSubmit({ dscEditora }) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Descrição <span className="text-black ml-1">*</span></label>
        <input value={dscEditora} onChange={(e) => setDsc(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={btnSec}>Cancelar</button>
        <button type="submit" disabled={saving} className={btnPri}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-55 transition-colors'
