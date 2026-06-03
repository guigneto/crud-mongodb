import { useCallback, useEffect, useState, useMemo } from 'react'
import { PenLine } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Autor, getAutores, createAutor, updateAutor, deleteAutor } from '../services/autores.service'

type Form = { nome: string; nacionalidade: string }
const empty: Form = { nome: '', nacionalidade: '' }

export default function Autores() {
  const [data, setData]         = useState<Autor[]>([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [editing, setEditing]   = useState<Autor | undefined>()
  const [query, setQuery]       = useState('')
  const [page, setPage]         = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getAutores(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    const lq = query.toLowerCase()
    return data.filter((a) => a.nome.toLowerCase().includes(lq) || a.nacionalidade?.toLowerCase().includes(lq))
  }, [data, query])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(a: Autor) { setEditing(a); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteAutor(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload = { nome: form.nome, nacionalidade: form.nacionalidade || undefined }
    if (editing) await updateAutor(editing._id!, payload)
    else await createAutor(payload)
    close(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Autores</h1>
          <p className="text-gray-500 mt-1">{data.length} cadastrado(s)</p>
        </div>
        <button onClick={openNew} className={btn}><PenLine size={16} /> Novo Autor</button>
      </div>

      <div className="mb-4 max-w-xs"><SearchBar placeholder="Buscar por nome ou nacionalidade…" onSearch={setQuery} /></div>

      {loading ? <Skeleton /> : !filtered.length ? <Empty /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><Th>Nome</Th><Th>Nacionalidade</Th><Th right>Ações</Th></tr></thead>
            <tbody>
              {paginated.map((a) => (
                <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{a.nacionalidade ?? '—'}</td>
                  <td className="px-4 py-3"><TableActions onEdit={() => openEdit(a)} onDelete={() => handleDelete(a._id!)} /></td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Autor' : 'Novo Autor'}>
        <AutorForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function AutorForm({ initial, onSubmit, onCancel }: { initial?: Autor; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial ? { nome: initial.nome, nacionalidade: initial.nacionalidade ?? '' } : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { nome: initial.nome, nacionalidade: initial.nacionalidade ?? '' } : empty)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="Nome" required><input value={form.nome} onChange={s('nome')} className={inp} /></F>
      <F label="Nacionalidade"><input value={form.nacionalidade} onChange={s('nacionalidade')} className={inp} /></F>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={btnSec}>Cancelar</button>
        <button type="submit" disabled={saving} className={btnPri}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>{children}</div>
}
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 font-medium${right ? ' text-right' : ''}`}>{children}</th>
}
function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }
function Empty() { return <p className="text-center text-gray-400 py-16">Nenhum autor cadastrado.</p> }

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const inp    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
