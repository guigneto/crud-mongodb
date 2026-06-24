import { useCallback, useEffect, useState, useMemo } from 'react'
import { CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import CustomSelect from '../components/CustomSelect'
import { type Pagamento, type FormaPagto, getPagamentos, createPagamento, updatePagamento, deletePagamento } from '../services/pagamentos.service'

const FORMAS: FormaPagto[] = ['dinheiro', 'cartao_credito', 'cartao_debito', 'picpay', 'pix']
const formaLabel: Record<FormaPagto, string> = {
  dinheiro: 'Dinheiro', cartao_credito: 'Cartão Crédito',
  cartao_debito: 'Cartão Débito', picpay: 'PicPay', pix: 'Pix',
}
const formaBadge: Record<FormaPagto, string> = {
  dinheiro: 'bg-green-100 text-green-700', cartao_credito: 'bg-blue-100 text-blue-700',
  cartao_debito: 'bg-indigo-100 text-indigo-700', picpay: 'bg-blue-100 text-blue-700', pix: 'bg-teal-100 text-teal-700',
}

type Form = { idMult: string; valPagto: string; dscFormPagto: FormaPagto; valDescPagto: string }
const empty: Form = { idMult: '', valPagto: '0', dscFormPagto: 'pix', valDescPagto: '0' }

export default function Pagamentos() {
  const [data, setData]       = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Pagamento | undefined>()
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getPagamentos(); setData(r.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    return data.filter((p) => String(p.idMult).includes(query))
  }, [data, query])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(p: Pagamento) { setEditing(p); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deletePagamento(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload = { idMult: String(form.idMult), valPagto: Number(form.valPagto), dscFormPagto: form.dscFormPagto, valDescPagto: Number(form.valDescPagto) }
    if (editing) await updatePagamento(editing._id!, payload)
    else await createPagamento(payload)
    close(); load()
  }

  const totalPago = data.reduce((acc, p) => acc + p.valPagto, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de pagamentos — total pago: <span className="text-green-600 font-medium">R$ {totalPago.toFixed(2)}</span>
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <CreditCard size={16} /> Novo Pagamento
        </button>
      </div>

      <div className="mb-6 w-full">
        <SearchBar placeholder="Buscar por ID da multa…" onSearch={setQuery} />
      </div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum pagamento registrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><Th>ID Multa</Th><Th>Forma</Th><Th>Valor Pago</Th><Th>Desconto</Th><Th right>Ações</Th></tr></thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.idMult}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formaBadge[p.dscFormPagto]}`}>{formaLabel[p.dscFormPagto]}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">R$ {p.valPagto.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">R$ {p.valDescPagto.toFixed(2)}</td>
                  <td className="px-4 py-3"><TableActions onEdit={() => openEdit(p)} onDelete={() => handleDelete(p._id!)} /></td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Pagamento' : 'Novo Pagamento'}>
        <PagamentoForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function PagamentoForm({ initial, onSubmit, onCancel }: { initial?: Pagamento; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { idMult: String(initial.idMult), valPagto: String(initial.valPagto), dscFormPagto: initial.dscFormPagto, valDescPagto: String(initial.valDescPagto) }
    : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { idMult: String(initial.idMult), valPagto: String(initial.valPagto), dscFormPagto: initial.dscFormPagto, valDescPagto: String(initial.valDescPagto) } : empty)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.idMult) { setError('ID da multa é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="ID da Multa" required><input type="number" min="1" value={form.idMult} onChange={s('idMult')} className={inp} /></F>
      <F label="Forma de Pagamento" required>
        <CustomSelect
          value={form.dscFormPagto}
          onChange={(val) => setForm(f => ({ ...f, dscFormPagto: val as FormaPagto }))}
          options={FORMAS.map((f) => ({ value: f, label: formaLabel[f] }))}
          placeholder="Selecione a forma de pagamento..."
        />
      </F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Valor Pago (R$)" required><input type="number" min="0" step="0.01" value={form.valPagto} onChange={s('valPagto')} className={inp} /></F>
        <F label="Desconto (R$)"><input type="number" min="0" step="0.01" value={form.valDescPagto} onChange={s('valDescPagto')} className={inp} /></F>
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
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-black ml-1">*</span>}</label>{children}</div>
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 font-medium${right ? ' text-right' : ''}`}>{children}</th>
}
function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const inp    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
