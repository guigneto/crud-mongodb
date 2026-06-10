import { useCallback, useEffect, useState, useMemo } from 'react'
import { AlertCircle, CreditCard, Filter as FilterIcon } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import CustomSelect from '../components/CustomSelect'
import { type Multa, getMultas, createMulta, updateMulta, deleteMulta } from '../services/multas.service'
import { type Pagamento, type FormaPagto, getPagamentos, createPagamento } from '../services/pagamentos.service'

const TIPOS = ['atraso', 'dano_perda'] as const
const tipoLabel = { atraso: 'Atraso', dano_perda: 'Dano / Perda' }
const tipoBadge = { atraso: 'bg-blue-100 text-blue-700', dano_perda: 'bg-red-100 text-red-700' }

const FORMAS: FormaPagto[] = ['dinheiro', 'cartao_credito', 'cartao_debito', 'picpay', 'pix']
const formaLabel: Record<FormaPagto, string> = {
  dinheiro: 'Dinheiro', cartao_credito: 'Cartão Crédito',
  cartao_debito: 'Cartão Débito', picpay: 'PicPay', pix: 'Pix',
}
const formaBadge: Record<FormaPagto, string> = {
  dinheiro: 'bg-green-100 text-green-700', cartao_credito: 'bg-blue-100 text-blue-700',
  cartao_debito: 'bg-indigo-100 text-indigo-700', picpay: 'bg-blue-100 text-blue-700', pix: 'bg-teal-100 text-teal-700',
}

type MultaForm = { idEmpr: string; dscTipMult: typeof TIPOS[number]; valMult: string }
const emptyMulta: MultaForm = { idEmpr: '', dscTipMult: 'atraso', valMult: '0' }

type PagtoForm = { valPagto: string; dscFormPagto: FormaPagto; valDescPagto: string }
const emptyPagto: PagtoForm = { valPagto: '0', dscFormPagto: 'pix', valDescPagto: '0' }

type StatusFilter = 'todos' | 'pendente' | 'paga'

export default function Multas() {
  const [multas, setMultas]       = useState<Multa[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading]     = useState(true)
  const [openMulta, setOpenMulta] = useState(false)
  const [editing, setEditing]     = useState<Multa | undefined>()
  const [openPagto, setOpenPagto] = useState(false)
  const [payingMulta, setPayingMulta] = useState<Multa | undefined>()
  const [query, setQuery]         = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [page, setPage]           = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rM, rP] = await Promise.all([getMultas(), getPagamentos()])
      setMultas(rM.data)
      setPagamentos(rP.data)
    }
    catch { setMultas([]); setPagamentos([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const pagtoByMulta = useMemo(() => {
    const map: Record<string, Pagamento> = {}
    pagamentos.forEach(p => { map[String(p.idMult)] = p })
    return map
  }, [pagamentos])

  const getStatus = (m: Multa): 'pendente' | 'paga' => {
    return pagtoByMulta[String(m._id)] ? 'paga' : 'pendente'
  }

  const filtered = useMemo(() => {
    let result = multas
    if (query) {
      result = result.filter((m) => String(m.idEmpr).includes(query))
    }
    if (statusFilter !== 'todos') {
      result = result.filter((m) => getStatus(m) === statusFilter)
    }
    return result
  }, [multas, query, statusFilter, pagtoByMulta])

  useEffect(() => { setPage(1) }, [query, statusFilter])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const totalPendente = multas.filter(m => getStatus(m) === 'pendente').reduce((acc, m) => acc + m.valMult, 0)
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valPagto, 0)

  function openNewMulta() { setEditing(undefined); setOpenMulta(true) }
  function openEditMulta(m: Multa) { setEditing(m); setOpenMulta(true) }
  function closeMulta() { setEditing(undefined); setOpenMulta(false) }

  function openPayment(m: Multa) { setPayingMulta(m); setOpenPagto(true) }
  function closePagto() { setPayingMulta(undefined); setOpenPagto(false) }

  async function handleDeleteMulta(id: string) {
    if (!confirm('Confirma exclusão da multa?')) return
    await deleteMulta(id); load()
  }

  async function handleSubmitMulta(form: MultaForm) {
    const payload = { idEmpr: Number(form.idEmpr), dscTipMult: form.dscTipMult, valMult: Number(form.valMult) }
    if (editing) await updateMulta(editing._id!, payload)
    else await createMulta(payload)
    closeMulta(); load()
  }

  async function handleSubmitPagto(form: PagtoForm) {
    if (!payingMulta) return
    const payload = { idMult: Number(payingMulta._id), valPagto: Number(form.valPagto), dscFormPagto: form.dscFormPagto, valDescPagto: Number(form.valDescPagto) }
    await createPagamento(payload)
    closePagto(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de multas — pendente: <span className="text-red-600 font-medium">R$ {totalPendente.toFixed(2)}</span>
            {totalPago > 0 && <> · pago: <span className="text-emerald-600 font-medium">R$ {totalPago.toFixed(2)}</span></>}
          </p>
        </div>
        <button onClick={openNewMulta} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <AlertCircle size={16} /> Nova Multa
        </button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar placeholder="Buscar por ID de empréstimo…" onSearch={setQuery} />
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as StatusFilter)}
              options={[
                { value: 'todos', label: 'Status: Todos' },
                { value: 'pendente', label: 'Status: Pendentes' },
                { value: 'paga', label: 'Status: Pagas' },
              ]}
              variant="default"
              className="w-full bg-gray-100 border-none rounded-[14px] px-4 py-3 text-sm flex justify-between items-center cursor-pointer transition-colors focus-within:bg-gray-200"
            />
          </div>
        </div>
      </div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhuma multa encontrada.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><Th>ID Empréstimo</Th><Th>Tipo</Th><Th>Valor</Th><Th>Status</Th><Th>Pagamento</Th><Th right>Ações</Th></tr></thead>
            <tbody>
              {paginated.map((m) => {
                const status = getStatus(m)
                const pagto = pagtoByMulta[String(m._id)]
                return (
                  <tr key={m._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.idEmpr}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoBadge[m.dscTipMult]}`}>{tipoLabel[m.dscTipMult]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">R$ {m.valMult.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status === 'paga' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {status === 'paga' ? 'Paga' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {pagto ? (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formaBadge[pagto.dscFormPagto]}`}>
                            {formaLabel[pagto.dscFormPagto]}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">R$ {pagto.valPagto.toFixed(2)}</span>
                          {pagto.valDescPagto > 0 && <span className="text-xs text-gray-400 ml-1">(desc. R$ {pagto.valDescPagto.toFixed(2)})</span>}
                        </div>
                      ) : (
                        <button
                          onClick={() => openPayment(m)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <CreditCard size={13} /> Registrar Pagamento
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3"><TableActions onEdit={() => openEditMulta(m)} onDelete={() => handleDeleteMulta(m._id!)} /></td>
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

      {/* Modal Nova/Editar Multa */}
      <Modal open={openMulta} onClose={closeMulta} title={editing ? 'Editar Multa' : 'Nova Multa'}>
        <MultaFormComponent initial={editing} onSubmit={handleSubmitMulta} onCancel={closeMulta} />
      </Modal>

      {/* Modal Registrar Pagamento */}
      <Modal open={openPagto} onClose={closePagto} title="Registrar Pagamento">
        {payingMulta && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Pagamento referente à multa:</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                Empréstimo #{payingMulta.idEmpr} · <span className={`${tipoBadge[payingMulta.dscTipMult]} px-2 py-0.5 rounded-full text-xs font-medium`}>{tipoLabel[payingMulta.dscTipMult]}</span> · <span className="text-red-600">R$ {payingMulta.valMult.toFixed(2)}</span>
              </p>
            </div>
            <PagamentoFormComponent valorMulta={payingMulta.valMult} onSubmit={handleSubmitPagto} onCancel={closePagto} />
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ── Multa Form ────────────────────────────────────────────────────── */
function MultaFormComponent({ initial, onSubmit, onCancel }: { initial?: Multa; onSubmit: (f: MultaForm) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<MultaForm>(initial
    ? { idEmpr: String(initial.idEmpr), dscTipMult: initial.dscTipMult, valMult: String(initial.valMult) }
    : emptyMulta)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { idEmpr: String(initial.idEmpr), dscTipMult: initial.dscTipMult, valMult: String(initial.valMult) } : emptyMulta)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.idEmpr) { setError('ID do empréstimo é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof MultaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="ID do Empréstimo" required><input type="number" min="1" value={form.idEmpr} onChange={s('idEmpr')} className={inp} /></F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Tipo de Multa" required>
          <CustomSelect
            value={form.dscTipMult}
            onChange={(val) => setForm(f => ({ ...f, dscTipMult: val as typeof TIPOS[number] }))}
            options={TIPOS.map((t) => ({ value: t, label: tipoLabel[t] }))}
            placeholder="Selecione o tipo..."
          />
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

/* ── Pagamento Form ────────────────────────────────────────────────── */
function PagamentoFormComponent({ valorMulta, onSubmit, onCancel }: { valorMulta: number; onSubmit: (f: PagtoForm) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<PagtoForm>({ ...emptyPagto, valPagto: String(valorMulta) })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao registrar pagamento.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="Forma de Pagamento" required>
        <CustomSelect
          value={form.dscFormPagto}
          onChange={(val) => setForm(f => ({ ...f, dscFormPagto: val as FormaPagto }))}
          options={FORMAS.map((f) => ({ value: f, label: formaLabel[f] }))}
          placeholder="Selecione a forma de pagamento..."
        />
      </F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Valor Pago (R$)" required><input type="number" min="0" step="0.01" value={form.valPagto} onChange={(e) => setForm(f => ({ ...f, valPagto: e.target.value }))} className={inp} /></F>
        <F label="Desconto (R$)"><input type="number" min="0" step="0.01" value={form.valDescPagto} onChange={(e) => setForm(f => ({ ...f, valDescPagto: e.target.value }))} className={inp} /></F>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={btnSec}>Cancelar</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">{saving ? 'Registrando…' : 'Confirmar Pagamento'}</button>
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
