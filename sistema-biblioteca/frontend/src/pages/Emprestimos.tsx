import { useCallback, useEffect, useState, useMemo } from 'react'
import { PlusCircle, CheckCircle2 } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import { type Emprestimo, getEmprestimos, createEmprestimo, updateEmprestimo, deleteEmprestimo } from '../services/emprestimos.service'
import { getAssociados, type Associado } from '../services/associados.service'
import { getExemplares, type Exemplar } from '../services/exemplares.service'

type Status = 'ativo' | 'atrasado' | 'devolvido'
type Filter = 'todos' | 'ativos' | 'atrasados'

function getStatus(e: Emprestimo): Status {
  if (e.datEfetEntrEmpr) return 'devolvido'
  if (new Date(e.datPrevEntrEmpr) < new Date()) return 'atrasado'
  return 'ativo'
}

const statusStyle: Record<Status, string> = {
  ativo:     'bg-green-100 text-green-700',
  atrasado:  'bg-red-100 text-red-700',
  devolvido: 'bg-gray-100 text-gray-500',
}

type Form = { idAssoc: string; idExemplar: string; datRetEmpr: string; datPrevEntrEmpr: string }
const today = () => new Date().toISOString().split('T')[0]
const emptyForm: Form = { idAssoc: '', idExemplar: '', datRetEmpr: today(), datPrevEntrEmpr: '' }

export default function Emprestimos() {
  const [data, setData]       = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<Filter>('todos')
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Emprestimo | undefined>()
  const [page, setPage]       = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getEmprestimos(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    return data.filter((e) => {
      const s = getStatus(e)
      if (filter === 'ativos')    return s === 'ativo'
      if (filter === 'atrasados') return s === 'atrasado'
      return true
    })
  }, [data, filter])

  useEffect(() => { setPage(1) }, [filter])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function count(f: Filter) {
    if (f === 'todos') return data.length
    const s = f === 'ativos' ? 'ativo' : 'atrasado'
    return data.filter((e) => getStatus(e) === s).length
  }

  async function handleReturn(id: string) {
    if (!confirm('Confirmar devolução?')) return
    await updateEmprestimo(id, { datEfetEntrEmpr: today() }); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteEmprestimo(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload = { idAssoc: form.idAssoc, idExemplar: form.idExemplar, datRetEmpr: form.datRetEmpr, datPrevEntrEmpr: form.datPrevEntrEmpr }
    if (editing) await updateEmprestimo(editing._id!, payload)
    else await createEmprestimo(payload)
    setOpen(false); setEditing(undefined); load()
  }

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(e: Emprestimo) { setEditing(e); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  const tabCls = (f: Filter) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-gray-500 mt-1">{data.length} registro(s) no total</p>
        </div>
        <button onClick={openNew} className={btn}><PlusCircle size={16} /> Novo Empréstimo</button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['todos', 'ativos', 'atrasados'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={tabCls(f)}>
            {{todos: 'Todos', ativos: 'Ativos', atrasados: 'Atrasados'}[f]}
            <span className="ml-2 text-xs opacity-75">({count(f)})</span>
          </button>
        ))}
      </div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum empréstimo encontrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <Th>ID Assoc.</Th><Th>ID Exempl.</Th><Th>Retirada</Th><Th>Dev. Prevista</Th><Th>Dev. Efetiva</Th><Th>Status</Th><Th right>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => {
                const s = getStatus(e)
                return (
                  <tr key={e._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{e.idAssoc}</td>
                    <td className="px-4 py-3 text-gray-600">{e.idExemplar}</td>
                    <td className="px-4 py-3 text-gray-600">{e.datRetEmpr?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{e.datPrevEntrEmpr?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{e.datEfetEntrEmpr?.slice(0, 10) ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[s]}`}>
                        {{ ativo: 'Ativo', atrasado: 'Atrasado', devolvido: 'Devolvido' }[s]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1">
                        {s !== 'devolvido' && (
                          <button onClick={() => handleReturn(e._id!)} title="Registrar devolução"
                            className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50 transition-colors">
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        <TableActions onEdit={() => openEdit(e)} onDelete={() => handleDelete(e._id!)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Empréstimo' : 'Novo Empréstimo'}>
        <EmprestimoForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function EmprestimoForm({ initial, onSubmit, onCancel }: { initial?: Emprestimo; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { idAssoc: String(initial.idAssoc), idExemplar: String(initial.idExemplar), datRetEmpr: initial.datRetEmpr?.slice(0, 10) ?? today(), datPrevEntrEmpr: initial.datPrevEntrEmpr?.slice(0, 10) ?? '' }
    : emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [associados, setAssociados] = useState<Associado[]>([])
  const [exemplares, setExemplares] = useState<Exemplar[]>([])

  useEffect(() => {
    getAssociados().then(r => setAssociados(r.data)).catch(() => {})
    getExemplares().then(r => setExemplares(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setForm(initial
      ? { idAssoc: String(initial.idAssoc), idExemplar: String(initial.idExemplar), datRetEmpr: initial.datRetEmpr?.slice(0, 10) ?? today(), datPrevEntrEmpr: initial.datPrevEntrEmpr?.slice(0, 10) ?? '' }
      : emptyForm)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.idAssoc || !form.idExemplar || !form.datPrevEntrEmpr) { setError('Todos os campos são obrigatórios.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch (err: any) { setError(err?.response?.data?.error ?? 'Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <F label="Associado" required>
          <select value={form.idAssoc} onChange={s('idAssoc')} className={inp + ' bg-white'}>
            <option value="">Selecione um associado...</option>
            {associados.map(a => <option key={a._id} value={a._id}>{a.nomAssoc}</option>)}
          </select>
        </F>
        <F label="ID do Exemplar" required>
          <select value={form.idExemplar} onChange={s('idExemplar')} className={inp + ' bg-white'}>
            <option value="">Selecione o exemplar...</option>
            {exemplares.map(ex => <option key={ex._id} value={ex._id}>Exemplar #{ex._id?.slice(-4)}</option>)}
          </select>
        </F>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <F label="Data de Retirada" required><input type="date" value={form.datRetEmpr} onChange={s('datRetEmpr')} className={inp} /></F>
        <F label="Devolução Prevista" required><input type="date" value={form.datPrevEntrEmpr} onChange={s('datPrevEntrEmpr')} className={inp} /></F>
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
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
