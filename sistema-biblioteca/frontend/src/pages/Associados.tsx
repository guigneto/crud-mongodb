import { useCallback, useEffect, useState, useMemo } from 'react'
import { UserPlus } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Associado, getAssociados, createAssociado, updateAssociado, deleteAssociado } from '../services/associados.service'

const SEXO  = { M: 'Masculino', F: 'Feminino' }
const TIPO  = { comum: 'Comum', vip: 'VIP' }
const tipoBadge = { comum: 'bg-gray-100 text-gray-600', vip: 'bg-purple-100 text-purple-700' }

type Form = { nomAssoc: string; indSexoAssoc: 'M' | 'F'; dscEnderecoAssoc: string; dscTipoAssoc: 'comum' | 'vip' }
const empty: Form = { nomAssoc: '', indSexoAssoc: 'M', dscEnderecoAssoc: '', dscTipoAssoc: 'comum' }

export default function Associados() {
  const [data, setData]       = useState<Associado[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Associado | undefined>()
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getAssociados(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    const lq = query.toLowerCase()
    return data.filter((a) => a.nomAssoc.toLowerCase().includes(lq))
  }, [data, query])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew()  { setEditing(undefined); setOpen(true) }
  function openEdit(a: Associado) { setEditing(a); setOpen(true) }
  function close()    { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteAssociado(id); load()
  }

  async function handleSubmit(form: Form) {
    if (editing) await updateAssociado(editing._id!, form)
    else await createAssociado(form)
    close(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Associados</h1>
          <p className="text-gray-500 mt-1">{data.length} cadastrado(s)</p>
        </div>
        <button onClick={openNew} className={btn}>
          <UserPlus size={16} /> Novo Associado
        </button>
      </div>

      <div className="mb-4 max-w-xs">
        <SearchBar placeholder="Buscar por nome…" onSearch={setQuery} />
      </div>

      {loading ? <Skeleton /> : !filtered.length
        ? <Empty msg="Nenhum associado cadastrado." />
        : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <Th>Nome</Th><Th>Sexo</Th><Th>Endereço</Th><Th>Tipo</Th><Th right>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((a) => (
                  <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className={td + ' font-medium text-gray-900'}>{a.nomAssoc}</td>
                    <td className={td}>{SEXO[a.indSexoAssoc]}</td>
                    <td className={td + ' max-w-xs truncate'}>{a.dscEnderecoAssoc}</td>
                    <td className={td}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoBadge[a.dscTipoAssoc]}`}>{TIPO[a.dscTipoAssoc]}</span>
                    </td>
                    <td className={td}><TableActions onEdit={() => openEdit(a)} onDelete={() => handleDelete(a._id!)} /></td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Associado' : 'Novo Associado'}>
        <AssociadoForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function AssociadoForm({ initial, onSubmit, onCancel }: { initial?: Associado; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { nomAssoc: initial.nomAssoc, indSexoAssoc: initial.indSexoAssoc, dscEnderecoAssoc: initial.dscEnderecoAssoc, dscTipoAssoc: initial.dscTipoAssoc }
    : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { nomAssoc: initial.nomAssoc, indSexoAssoc: initial.indSexoAssoc, dscEnderecoAssoc: initial.dscEnderecoAssoc, dscTipoAssoc: initial.dscTipoAssoc } : empty)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nomAssoc.trim() || !form.dscEnderecoAssoc.trim()) { setError('Nome e endereço são obrigatórios.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="Nome" required><input value={form.nomAssoc} onChange={s('nomAssoc')} className={inp} /></F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Sexo" required>
          <select value={form.indSexoAssoc} onChange={s('indSexoAssoc')} className={sel}>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </F>
        <F label="Tipo" required>
          <select value={form.dscTipoAssoc} onChange={s('dscTipoAssoc')} className={sel}>
            <option value="comum">Comum</option>
            <option value="vip">VIP</option>
          </select>
        </F>
      </div>
      <F label="Endereço" required><input value={form.dscEnderecoAssoc} onChange={s('dscEnderecoAssoc')} className={inp} /></F>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={btnSec}>Cancelar</button>
        <button type="submit" disabled={saving} className={btnPri}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

// ── shared helpers ──────────────────────────────────────────────────────────
function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>{children}</div>
}
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 font-medium${right ? ' text-right' : ''}`}>{children}</th>
}
function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }
function Empty({ msg }: { msg: string }) { return <p className="text-center text-gray-400 py-16">{msg}</p> }

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const td     = 'px-4 py-3 text-gray-600'
const inp    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const sel    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
