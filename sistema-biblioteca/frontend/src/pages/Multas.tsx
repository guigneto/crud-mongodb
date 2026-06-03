import { useCallback, useEffect, useState, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Multa, getMultas, createMulta, updateMulta, deleteMulta } from '../services/multas.service'

const TIPOS = ['atraso', 'dano_perda'] as const
const tipoLabel = { atraso: 'Atraso', dano_perda: 'Dano / Perda' }
const tipoBadge = { atraso: 'bg-orange-100 text-orange-700', dano_perda: 'bg-red-100 text-red-700' }

type Form = { idEmpr: string; dscTipMult: typeof TIPOS[number]; valMult: string }
const empty: Form = { idEmpr: '', dscTipMult: 'atraso', valMult: '0' }

export default function Multas() {
  const [data, setData]       = useState<Multa[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Multa | undefined>()
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getMultas(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    return data.filter((m) => String(m.idEmpr).includes(query))
  }, [data, query])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(m: Multa) { setEditing(m); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteMulta(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload = { idEmpr: Number(form.idEmpr), dscTipMult: form.dscTipMult, valMult: Number(form.valMult) }
    if (editing) await updateMulta(editing._id!, payload)
    else await createMulta(payload)
    close(); load()
  }

  const totalPendente = data.reduce((acc, m) => acc + m.valMult, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multas</h1>
          <p className="text-gray-500 mt-1">{data.length} multa(s) — total: <span className="text-red-600 font-medium">R$ {totalPendente.toFixed(2)}</span></p>
        </div>
        <button onClick={openNew} className={btn}><AlertCircle size={16} /> Nova Multa</button>
      </div>

      <div className="mb-4 max-w-xs"><SearchBar placeholder="Buscar por ID de empréstimo…" onSearch={setQuery} /></div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhuma multa registrada.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><Th>ID Empréstimo</Th><Th>Tipo</Th><Th>Valor</Th><Th right>Ações</Th></tr></thead>
            <tbody>
              {paginated.map((m) => (
                <tr key={m._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.idEmpr}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoBadge[m.dscTipMult]}`}>{tipoLabel[m.dscTipMult]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">R$ {m.valMult.toFixed(2)}</td>
                  <td className="px-4 py-3"><TableActions onEdit={() => openEdit(m)} onDelete={() => handleDelete(m._id!)} /></td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Multa' : 'Nova Multa'}>
        <MultaForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function MultaForm({ initial, onSubmit, onCancel }: { initial?: Multa; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { idEmpr: String(initial.idEmpr), dscTipMult: initial.dscTipMult, valMult: String(initial.valMult) }
    : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { idEmpr: String(initial.idEmpr), dscTipMult: initial.dscTipMult, valMult: String(initial.valMult) } : empty)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.idEmpr) { setError('ID do empréstimo é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="ID do Empréstimo" required><input type="number" min="1" value={form.idEmpr} onChange={s('idEmpr')} className={inp} /></F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Tipo de Multa" required>
          <select value={form.dscTipMult} onChange={s('dscTipMult')} className={sel}>
            {TIPOS.map((t) => <option key={t} value={t}>{tipoLabel[t]}</option>)}
          </select>
        </F>
        <F label="Valor (R$)" required><input type="number" min="0" step="0.01" value={form.valMult} onChange={s('valMult')} className={inp} /></F>
      </div>
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

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const inp    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const sel    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
