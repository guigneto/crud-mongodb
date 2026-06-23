import { useCallback, useEffect, useState, useMemo, useRef, type FormEvent } from 'react'
import { PlusCircle, CheckCircle2, BookOpen, UserCheck, ArrowRight, ArrowLeft, AlertTriangle, Crown, ShieldCheck, Search, X, Plus, Trash2, Calendar, Clock, ChevronDown, User, BookOpenCheck, Filter as FilterIcon, RefreshCw, XCircle } from 'lucide-react'
import Modal from '../components/Modal'
import CustomSelect from '../components/CustomSelect'
import SearchBar from '../components/SearchBar'
import { type Emprestimo, getEmprestimos, createEmprestimo, updateEmprestimo, deleteEmprestimo, getEmprestimosAtivos, renovarEmprestimo, cancelarEmprestimo } from '../services/emprestimos.service'
import { getAssociados, type Associado } from '../services/associados.service'
import { getExemplares, type Exemplar } from '../services/exemplares.service'
import { getProdutos, type Produto } from '../services/produtos.service'
import { formatDateBR, formatToDateInput } from '../utils/date'


type Status = 'ativo' | 'atrasado' | 'devolvido' | 'cancelado'
type Filter = 'todos' | 'ativos' | 'atrasados' | 'devolvidos' | 'cancelados'

function getStatus(e: Emprestimo): Status {
  if (e.status === 'cancelado') return 'cancelado'
  if (e.datEfetEntrEmpr) return 'devolvido'
  if (new Date(e.datPrevEntrEmpr) < new Date()) return 'atrasado'
  return 'ativo'
}

const statusStyle: Record<Status, string> = {
  ativo:     'bg-green-100 text-green-700',
  atrasado:  'bg-red-100 text-red-700',
  devolvido: 'bg-gray-100 text-gray-500',
  cancelado: 'bg-blue-100 text-blue-700',
}

type Form = { idAssoc: string; idExemplar: string; idExemplares: string[]; datRetEmpr: string; datPrevEntrEmpr: string }
const today = () => new Date().toISOString().split('T')[0]
const getDefaultPrevDate = (days = 7) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
const getEmptyForm = (): Form => ({ idAssoc: '', idExemplar: '', idExemplares: [], datRetEmpr: today(), datPrevEntrEmpr: getDefaultPrevDate() })

export default function Emprestimos() {
  const [data, setData]       = useState<Emprestimo[]>([])
  const [associados, setAssociados] = useState<Associado[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [exemplares, setExemplares] = useState<Exemplar[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<Filter>('todos')
  const [query, setQuery]     = useState('')
  const [open, setOpen]       = useState(false)
  const [actionModal, setActionModal] = useState<{ type: 'devolver' | 'renovar' | 'cancelar' | null; id: string | null }>({ type: null, id: null })
  const [cancelReason, setCancelReason] = useState('')
  const [estadoFisico, setEstadoFisico] = useState('Excelente')
  const [actionError, setActionError] = useState('')
  const [editing, setEditing] = useState<Emprestimo | undefined>()
  const [page, setPage]       = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try { 
      const [rEmp, rAssoc, rProd, rEx] = await Promise.all([getEmprestimos(), getAssociados(), getProdutos(), getExemplares()])
      setData(rEmp.data)
      setAssociados(rAssoc.data)
      setProdutos(rProd.data)
      setExemplares(rEx.data)
    }
    catch { setData([]); setAssociados([]); setProdutos([]); setExemplares([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let result = [...data]
    if (filter === 'ativos') result = result.filter(e => e.status !== 'cancelado' && !e.datEfetEntrEmpr)
    if (filter === 'atrasados') result = result.filter(e => e.status !== 'cancelado' && !e.datEfetEntrEmpr && new Date(e.datPrevEntrEmpr) < new Date())
    if (filter === 'devolvidos') result = result.filter(e => e.status !== 'cancelado' && !!e.datEfetEntrEmpr)
    if (filter === 'cancelados') result = result.filter(e => e.status === 'cancelado')
    
    if (query) {
      const q = query.toLowerCase().trim()
      result = result.filter((e) => {
        const assoc = associados.find(a => a._id === e.idAssoc)
        const assocName = assoc ? assoc.nomAssoc.toLowerCase() : ''
        const assocCode = assoc && assoc.codAssoc ? assoc.codAssoc.toLowerCase() : ''
        const exemplar = exemplares.find(ex => ex._id === e.idExemplar)
        const prod = exemplar ? produtos.find(p => p._id === exemplar.idProd) : null
        const prodDisplay = prod ? prod.dscTituloProd.toLowerCase() : ''
        const prodCode = prod && prod.codProd ? prod.codProd.toLowerCase() : ''
        const prodId = prod && prod._id ? prod._id.toLowerCase() : ''
        return (
          (e.codEmpr && e.codEmpr.toLowerCase().includes(q)) ||
          assocName.includes(q) ||
          assocCode.includes(q) ||
          prodDisplay.includes(q) ||
          prodCode.includes(q) ||
          prodId.includes(q)
        )
      })
    }
    return result
  }, [data, filter, query, associados, exemplares, produtos])

  useEffect(() => { setPage(1) }, [filter, query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function count(f: Filter) {
    if (f === 'todos') return data.length
    const s = f === 'ativos' ? 'ativo' : f === 'atrasados' ? 'atrasado' : f === 'devolvidos' ? 'devolvido' : 'cancelado'
    return data.filter((e) => getStatus(e) === s).length
  }

  function handleReturn(id: string) { setActionModal({ type: 'devolver', id }); setActionError(''); setEstadoFisico('Excelente') }
  function handleRenovar(id: string) { setActionModal({ type: 'renovar', id }); setActionError(''); setCancelReason('') }
  function handleCancelar(id: string) { setActionModal({ type: 'cancelar', id }); setActionError(''); setCancelReason('') }

  async function confirmAction() {
    if (!actionModal.id || !actionModal.type) return
    try {
      if (actionModal.type === 'devolver') {
        if (!estadoFisico) { setActionError('Selecione o estado físico.'); return }
        await updateEmprestimo(actionModal.id, { datEfetEntrEmpr: today(), estadoDevolucao: estadoFisico })
      } else if (actionModal.type === 'renovar') {
        await renovarEmprestimo(actionModal.id)
      } else if (actionModal.type === 'cancelar') {
        if (!cancelReason.trim()) { setActionError('O motivo é obrigatório.'); return }
        await cancelarEmprestimo(actionModal.id, cancelReason)
      }
      setActionModal({ type: null, id: null })
      load()
    } catch (err: any) {
      setActionError(err?.response?.data?.error || 'Erro ao processar ação.')
    }
  }

  async function handleSubmit(form: Form) {
    const ids = form.idExemplares && form.idExemplares.length > 0 ? form.idExemplares : [form.idExemplar].filter(Boolean)
    for (const id of ids) {
      await createEmprestimo({
        idAssoc: form.idAssoc,
        idExemplar: id,
        datRetEmpr: form.datRetEmpr,
        datPrevEntrEmpr: form.datPrevEntrEmpr
      })
    }
    setOpen(false); load()
  }

  function openNew() { setOpen(true) }
  function close() { setOpen(false) }

  const tabCls = (f: Filter) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os empréstimos e devoluções do acervo</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <PlusCircle size={16} /> Novo Empréstimo
        </button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar placeholder="Buscar por empréstimo, associado ou livro..." onSearch={setQuery} />
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={filter}
              onChange={(val) => setFilter(val as Filter)}
              options={[
                { value: 'todos', label: `Status: Todos (${count('todos')})` },
                { value: 'ativos', label: `Status: Ativos (${count('ativos')})` },
                { value: 'atrasados', label: `Status: Atrasados (${count('atrasados')})` },
                { value: 'devolvidos', label: `Status: Devolvidos (${count('devolvidos')})` },
                { value: 'cancelados', label: `Status: Cancelados (${count('cancelados')})` },
              ]}
              variant="default"
              className="w-full bg-gray-100 border-none rounded-[14px] px-4 py-3 text-sm flex justify-between items-center cursor-pointer transition-colors focus-within:bg-gray-200"
            />
          </div>
        </div>
      </div>

      {loading ? <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum empréstimo encontrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <Th>#</Th><Th>Associado</Th><Th>Produto</Th><Th>Retirada</Th><Th>Dev. Prevista</Th><Th>Dev. Efetiva</Th><Th>Status</Th><Th right>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e, index) => {
                const rowIndex = (page - 1) * ITEMS_PER_PAGE + index + 1
                const s = getStatus(e)
                const assoc = associados.find(a => a._id === e.idAssoc)
                const assocIdDisplay = assoc ? (assoc.codAssoc || assoc._id) : e.idAssoc
                
                const exemplar = exemplares.find(ex => ex._id === e.idExemplar)
                const prod = exemplar ? produtos.find(p => p._id === exemplar.idProd) : null
                const prodDisplay = prod ? prod.dscTituloProd : 'Desconhecido'
                const prodIdDisplay = prod ? (prod.codProd || prod._id) : (exemplar ? exemplar._id : e.idExemplar)

                return (
                  <tr key={e._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-500 text-xs">{rowIndex}</td>
                    
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{assoc ? assoc.nomAssoc : '—'}</span>
                        <span className="text-xs text-gray-400 mt-0.5">ID: {assocIdDisplay}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 truncate max-w-[200px]" title={prodDisplay}>{prodDisplay}</span>
                        <span className="text-xs text-gray-400 mt-0.5">ID: {prodIdDisplay}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{e.datRetEmpr?.slice(0, 10).split('-').reverse().join('/')}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{e.datPrevEntrEmpr?.slice(0, 10).split('-').reverse().join('/')}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-gray-600">
                      {e.datEfetEntrEmpr ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-500" />
                          <span className="text-emerald-600 font-medium">{e.datEfetEntrEmpr?.slice(0, 10).split('-').reverse().join('/')}</span>
                        </div>
                      ) : '—'}
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[s]}`}>
                        {{ ativo: 'Ativo', atrasado: 'Atrasado', devolvido: 'Devolvido', cancelado: 'Cancelado' }[s]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-2">
                        {s !== 'devolvido' && s !== 'cancelado' && (
                          <button onClick={() => handleReturn(e._id!)} title="Registrar devolução"
                            className="flex items-center gap-1.5 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium">
                            <CheckCircle2 size={14} /> Devolver
                          </button>
                        )}
                        {s !== 'devolvido' && s !== 'cancelado' && s !== 'atrasado' && (
                          <button onClick={() => handleRenovar(e._id!)} title="Renovar por mais 7 dias"
                            className="flex items-center gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium">
                            <RefreshCw size={14} /> Renovar
                          </button>
                        )}
                        {s !== 'devolvido' && s !== 'cancelado' && (
                          <button onClick={() => handleCancelar(e._id!)} title="Cancelar Empréstimo"
                            className="flex items-center gap-1.5 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium">
                            <XCircle size={14} /> Cancelar
                          </button>
                        )}
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

      {(() => {
        const selected = actionModal.id ? data.find(e => e._id === actionModal.id) : null;
        const assoc = selected ? associados.find(a => a._id === selected.idAssoc) : null;
        const exemplar = selected ? exemplares.find(ex => ex._id === selected.idExemplar) : null;
        const prod = exemplar ? produtos.find(p => p._id === exemplar.idProd) : null;
        const renovacoesAtuais = selected?.renovacoes || 0;

        return (
          <Modal open={!!actionModal.type} onClose={() => setActionModal({ type: null, id: null })} maxWidth={actionModal.type === 'renovar' ? 'max-w-xl' : 'max-w-md'} overflowVisible={true} title={
            actionModal.type === 'devolver' ? 'Confirmar Devolução' :
            actionModal.type === 'renovar' ? 'Confirmar Renovação' :
            actionModal.type === 'cancelar' ? 'Cancelar Empréstimo' : ''
          }>
            <div className="space-y-4">
              <p className="text-gray-600">
                {actionModal.type === 'devolver' && 'Você está prestes a registrar a devolução deste material. Por favor, confirme o estado físico do item:'}
                {actionModal.type === 'renovar' && 'Deseja renovar este empréstimo por mais 7 dias? O limite é de 2 renovações.'}
                {actionModal.type === 'cancelar' && 'Por favor, informe o motivo do cancelamento deste registro:'}
              </p>

              {actionModal.type === 'renovar' && selected && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Informações Gerais do Empréstimo</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Associado</span>
                      <span className="font-medium text-gray-900">{assoc?.nomAssoc || selected.idAssoc}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Livro</span>
                      <span className="font-medium text-gray-900">{prod?.dscTituloProd || 'Desconhecido'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Data de Retirada</span>
                      <span className="font-medium text-gray-900">{selected.datRetEmpr?.slice(0, 10).split('-').reverse().join('/')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Devolução Prevista</span>
                      <span className="font-medium text-gray-900">{selected.datPrevEntrEmpr?.slice(0, 10).split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200/50 flex justify-between items-center">
                    <span className="text-sm text-blue-800 font-medium">Renovações realizadas:</span>
                    <span className="px-2.5 py-1 bg-white text-blue-700 rounded-md font-bold shadow-sm border border-blue-100">
                      {renovacoesAtuais} de 2
                    </span>
                  </div>
                </div>
              )}

          {actionModal.type === 'devolver' && (
            <div>
              <CustomSelect
                value={estadoFisico}
                onChange={val => { setEstadoFisico(val); setActionError('') }}
                options={[
                  { value: 'Excelente', label: 'Excelente' },
                  { value: 'Bom', label: 'Bom' },
                  { value: 'Danificado', label: 'Danificado' },
                  { value: 'Perdido', label: 'Perdido' }
                ]}
              />
            </div>
          )}
          
          {actionModal.type === 'cancelar' && (
            <div>
              <input
                type="text"
                autoFocus
                placeholder="Motivo (ex: lido código de barras errado)"
                value={cancelReason}
                onChange={e => { setCancelReason(e.target.value); setActionError('') }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {actionError && <p className="text-sm text-red-500">{actionError}</p>}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setActionModal({ type: null, id: null })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={confirmAction} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              actionModal.type === 'cancelar' ? 'bg-red-600 hover:bg-red-700' :
              actionModal.type === 'renovar' ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-green-600 hover:bg-green-700'
            }`}>
              Confirmar
            </button>
          </div>
          </div>
        </Modal>
        )
      })()}

      <Modal open={open} onClose={close} title="Novo Empréstimo" maxWidth="max-w-3xl">
        <EmprestimoForm onSubmit={handleSubmit} onCancel={close} associados={associados} exemplares={exemplares} emprestimos={data} />
      </Modal>
    </div>
  )
}

/* ─── Stepper Form ─── */

function EmprestimoForm({ onSubmit, onCancel, associados, exemplares, emprestimos }: { onSubmit: (f: Form) => Promise<void>; onCancel: () => void; associados: Associado[]; exemplares: Exemplar[]; emprestimos: Emprestimo[] }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(getEmptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [produtos, setProdutos] = useState<Record<string, Produto>>({})
  const [ativosCount, setAtivosCount] = useState<number | null>(null)
  const [loadingAtivos, setLoadingAtivos] = useState(false)
  const [duracao, setDuracao] = useState<number>(7)
  const [assocQuery, setAssocQuery] = useState('')

  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + duracao)
    setForm(f => ({ ...f, datRetEmpr: today(), datPrevEntrEmpr: d.toISOString().split('T')[0] }))
  }, [duracao])

  useEffect(() => {
    getProdutos().then(r => {
      const pMap: Record<string, Produto> = {}
      r.data.forEach((p: Produto) => { pMap[p._id!] = p })
      setProdutos(pMap)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setForm(getEmptyForm())
    setError('')
    setStep(1)
    setAtivosCount(null)
  }, [])

  useEffect(() => {
    if (!form.idAssoc) { setAtivosCount(null); return }
    setLoadingAtivos(true)
    getEmprestimosAtivos(form.idAssoc)
      .then(r => setAtivosCount(r.data.count))
      .catch(() => setAtivosCount(null))
      .finally(() => setLoadingAtivos(false))
  }, [form.idAssoc])

  const selectedAssociado = associados.find(a => a._id === form.idAssoc)
  const isVip = selectedAssociado?.dscTipoAssoc === 'vip'
  const limiteAtingido = !isVip && ativosCount !== null && ativosCount >= 3
  const availableExemplares = exemplares.filter(ex => ex.dscStatusExemplar === 'Disponível' || !ex.dscStatusExemplar)

  function goNext() {
    if (step === 1) {
      if (form.idExemplares.length === 0) {
        setError('Selecione pelo menos um material antes de continuar.')
        return
      }
      setError('')
      setStep(2)
      return
    }
    if (step === 2) {
      if (!form.idAssoc) { setError('Selecione um associado.'); return }
      if (limiteAtingido) { setError('Associado comum já atingiu o limite de 3 empréstimos ativos.'); return }
      const ativos = ativosCount || 0
      const qtdDesejada = form.idExemplares.length
      if (!isVip && (ativos + qtdDesejada > 3)) {
        setError(`O associado comum possui ${ativos} empréstimo(s) ativo(s) e só pode levar mais ${3 - ativos}. (Selecionados: ${qtdDesejada})`)
        return
      }
      setError('')
      setStep(3)
    }
  }

  function goBack() {
    setError('')
    if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.idAssoc || form.idExemplares.length === 0) { setError('Dados incompletos.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch(err: any) {
      const msg = err?.response?.data?.error || 'Erro ao salvar.'
      setError(msg)
    } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // New mode: 2-step stepper
  return (
    <form onSubmit={submit}>
      {/* ── Stepper Header ── */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          step === 1 ? 'bg-blue-100 text-blue-700' : step > 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {step > 1 ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
          <span className="hidden sm:inline">Material</span>
        </div>
        <div className="h-px w-4 sm:w-8 bg-gray-300" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          step === 2 ? 'bg-blue-100 text-blue-700' : step > 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {step > 2 ? <CheckCircle2 size={16} /> : <UserCheck size={16} />}
          <span className="hidden sm:inline">Associado</span>
        </div>
        <div className="h-px w-4 sm:w-8 bg-gray-300" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          step === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
        }`}>
          <Calendar size={16} />
          <span className="hidden sm:inline">Confirmar</span>
        </div>
      </div>

      {/* ── Step 1: Material ── */}
      {step === 1 && (
        <div className="flex flex-col h-[540px] animate-fadeIn">
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Etapa 1: Selecionar Material</h3>
            <ExemplarMultiSelect
              selectedIds={form.idExemplares}
              onAdd={(id) => setForm(f => ({ ...f, idExemplares: [...f.idExemplares, id] }))}
              onRemove={(id) => setForm(f => ({ ...f, idExemplares: f.idExemplares.filter(x => x !== id) }))}
              exemplares={availableExemplares}
              produtos={produtos}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="grid grid-cols-2 w-full gap-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" onClick={onCancel} className={btnSec + ' w-full flex justify-center items-center'}>Cancelar</button>
            <button type="button" disabled={form.idExemplares.length === 0} onClick={goNext} className={btnPri + ' w-full flex justify-center items-center gap-2'}>
              Próximo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Associado ── */}
      {step === 2 && (() => {
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        const filteredAssociados = associados.filter(a => {
          const q = normalize(assocQuery)
          return normalize(a.nomAssoc).includes(q) || normalize(a.email || '').includes(q) || normalize(a.codAssoc || a._id || '').includes(q) || normalize(a.telefone || '').includes(q)
        })

        return (
          <div className="flex flex-col h-[540px] animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Etapa 2: Selecionar Associado</h3>
            
            {/* Search Field */}
            <div className="relative mb-4 flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar associado por Código, nome ou email."
                value={assocQuery}
                onChange={e => setAssocQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              />
              {assocQuery && (
                <button type="button" onClick={() => setAssocQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Associados List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
              {filteredAssociados.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Nenhum associado encontrado.</p>
              ) : (
                filteredAssociados.map(a => {
                  const isSelected = form.idAssoc === a._id
                  const isVipCard = a.dscTipoAssoc === 'vip'
                  return (
                    <div
                      key={a._id}
                      onClick={() => setForm(f => ({ ...f, idAssoc: a._id! }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? limiteAtingido 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 transition-colors ${
                        isSelected 
                          ? limiteAtingido 
                            ? 'bg-red-200 text-red-700' 
                            : isVipCard ? 'bg-amber-200 text-amber-700' : 'bg-blue-200 text-blue-700'
                          : isVipCard ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {a.nomAssoc.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-semibold truncate pr-2 ${isSelected ? (limiteAtingido ? 'text-red-900' : 'text-blue-900') : 'text-gray-900'}`}>
                            {a.nomAssoc}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                            isVipCard 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isVipCard ? 'VIP' : 'Comum'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                          <span>Cód: {a.codAssoc || a._id}</span>
                          <span>•</span>
                          <span className="truncate">{a.email}</span>
                          <span>•</span>
                          <span className="truncate">{a.telefone}</span>
                        </div>
                        
                        {/* Selected info / Limits */}
                        {isSelected && (
                          <div className="mt-3 pt-2 border-t border-black/5">
                            {loadingAtivos ? (
                              <div className="text-xs text-gray-500">Verificando status do associado...</div>
                            ) : isVipCard ? (
                              <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <Crown size={14} /> Acesso VIP ({ativosCount ?? 0} ativos no momento)
                              </div>
                            ) : limiteAtingido ? (
                              <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <AlertTriangle size={14} /> Limite de 3 empréstimos atingido!
                              </div>
                            ) : (
                              <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                <ShieldCheck size={14} /> {ativosCount ?? 0} de 3 empréstimos ativos utilizados
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {error && <p className="text-sm text-red-500 mt-2 flex-shrink-0">{error}</p>}
            <div className="grid grid-cols-2 w-full gap-3 pt-4 border-t border-gray-100 mt-4 flex-shrink-0">
              <button type="button" onClick={goBack} className={btnSec + ' w-full flex justify-center items-center gap-2'}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <button type="button" disabled={!form.idAssoc} onClick={goNext} className={btnPri + ' w-full flex justify-center items-center gap-2'}>
                Próximo <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── Step 3: Confirmar ── */}
      {step === 3 && (
        <div className="flex flex-col h-[540px] animate-fadeIn">
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Etapa 3: Confirmar Empréstimo</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-200 text-green-700 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                {selectedAssociado?.nomAssoc?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-green-900 text-lg">{selectedAssociado?.nomAssoc}</div>
                <div className="text-sm text-green-700">Código: {selectedAssociado?.codAssoc || selectedAssociado?._id} • {isVip ? 'VIP' : 'Comum'}</div>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {form.idExemplares.map(idEx => {
                const ex = exemplares.find(e => e._id === idEx)
                const title = ex ? (produtos[ex.idProd]?.dscTituloProd || 'Desconhecido') : 'Desconhecido'
                return (
                  <div key={idEx} className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">{title}</div>
                      <div className="text-xs text-blue-700">ID do Exemplar: {idEx}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração do empréstimo</label>
                <div className="relative">
                  <select value={duracao} onChange={e => setDuracao(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
                    <option value={7}>7 dias</option>
                    <option value={14}>14 dias</option>
                    <option value={21}>21 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de empréstimo</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formatDateBR(form.datRetEmpr)} readOnly className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de devolução</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formatDateBR(form.datPrevEntrEmpr)} readOnly className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="grid grid-cols-2 w-full gap-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" onClick={goBack} className={btnSec + ' w-full flex justify-center items-center gap-2'}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <button type="submit" disabled={saving} className={btnPri + ' w-full flex justify-center items-center gap-2'}>
              {saving ? 'Salvando…' : 'Confirmar Empréstimo'} <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

/* ─── Exemplar Search Bar ─── */

function ExemplarSearchBar({ value, onChange, exemplares, produtos }: {
  value: string
  onChange: (val: string) => void
  exemplares: Exemplar[]
  produtos: Record<string, Produto>
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const options = exemplares.map(ex => {
    const prod = produtos[ex.idProd]
    const title = prod?.dscTituloProd || 'Desconhecido'
    const label = ex.codExemplar ? `${title} (ID: ${ex.codExemplar})` : `${title} (ID: ${ex._id})`
    return { id: ex._id!, label, idProd: ex.idProd }
  })

  const filtered = query.trim()
    ? options.filter(o => normalize(o.label).includes(normalize(query)) || (o.id || '').includes(query))
    : options

  const selected = options.find(o => o.id === value)

  function handleSelect(id: string) {
    onChange(id)
    setQuery('')
    setFocused(false)
  }

  function handleClear() {
    onChange('')
    setQuery('')
  }

  return (
    <div ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Pesquisar Material<span className="text-black ml-1">*</span>
      </label>

      {selected ? (
        <div className="flex items-center gap-2 w-full border border-blue-300 bg-blue-50/50 rounded-xl px-3 py-2 text-sm">
          <BookOpen size={16} className="text-blue-600 flex-shrink-0" />
          <span className="flex-1 text-gray-900 font-medium truncate">{selected.label}</span>
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o título ou ID do exemplar..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Área de Resultados (Scrollable List) */}
          <div className="bg-white border border-gray-200 rounded-xl h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-400 text-center">Nenhum exemplar encontrado</div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o.id}
                  onClick={() => handleSelect(o.id)}
                  className="px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Exemplar Multi Select (Step 1) ─── */

function ExemplarMultiSelect({
  selectedIds,
  onAdd,
  onRemove,
  exemplares,
  produtos
}: {
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  exemplares: Exemplar[]
  produtos: Record<string, Produto>
}) {
  const [query, setQuery] = useState('')
  const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const isDigital = (p?: Produto) => p && (['nuvem', 'audiobook', 'software'].includes(p.dscTipoProd) || ['pdf', 'video'].includes(p.dscFormatoProd || ''))

  const options = exemplares.map(ex => {
    const prod = produtos[ex.idProd]
    const title = prod?.dscTituloProd || 'Desconhecido'
    const label = ex.codExemplar ? `${title} (ID: ${ex.codExemplar})` : `${title} (ID: ${ex._id})`
    return { id: ex._id!, label, idProd: ex.idProd }
  })

  const filtered = query.trim()
    ? options.filter(o => normalize(o.label).includes(normalize(query)) || (o.id || '').includes(query))
    : options

  const available = filtered.filter(o => !selectedIds.includes(o.id))
  const selectedItems = selectedIds.map(id => options.find(o => o.id === id)).filter(Boolean) as typeof options

  // Agrupando os disponíveis por Produto
  const groupedAvailable = Object.values(available.reduce((acc, o) => {
    if (!acc[o.idProd]) {
      const prod = produtos[o.idProd]
      const title = prod?.dscTituloProd || 'Desconhecido'
      const digital = isDigital(prod)
      acc[o.idProd] = { title, idProd: o.idProd, digital, exemplares: [] }
    }
    acc[o.idProd].exemplares.push(o)
    return acc
  }, {} as Record<string, { title: string, idProd: string, digital: boolean | undefined, exemplares: typeof options }>))

  return (
    <div className="grid grid-cols-2 gap-6 items-start">
      {/* Coluna Esquerda: Busca */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Pesquisar Material
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite título ou ID..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl h-[300px] overflow-y-auto p-2 space-y-2">
          {groupedAvailable.length === 0 ? (
             <div className="text-center text-sm text-gray-400 py-4">Nenhum material encontrado</div>
          ) : (
            groupedAvailable.map(g => (
              <div key={g.idProd} className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{g.title}</div>
                  {g.digital ? (
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded mt-1 border border-emerald-100">Acesso Digital Ilimitado ☁️</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-0.5">{g.exemplares.length} exemplar(es) disponível(eis)</div>
                  )}
                </div>
                <button type="button" onClick={() => onAdd(g.exemplares[0].id)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors flex-shrink-0 ml-2" title="Adicionar material">
                  <Plus size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coluna Direita: Carrinho */}
      <div className="space-y-3">
         <label className="block text-sm font-medium text-gray-700">
          Materiais Selecionados ({selectedItems.length})
        </label>
        <div className={`border rounded-xl h-[354px] p-2 overflow-y-auto ${selectedItems.length === 0 ? 'bg-gray-50 border-gray-200 border-dashed flex items-center justify-center' : 'bg-white border-gray-200 space-y-2'}`}>
          {selectedItems.length === 0 ? (
            <div className="text-center px-4">
              <BookOpen size={24} className="mx-auto text-gray-300 mb-2" />
              <div className="text-sm text-gray-500 font-medium">Nenhum material selecionado</div>
              <div className="text-xs text-gray-400 mt-1">Busque e adicione materiais ao lado</div>
            </div>
          ) : (
            selectedItems.map(o => (
              <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{o.label}</div>
                </div>
                <button type="button" onClick={() => onRemove(o.id)} className="w-8 h-8 rounded-full text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0 ml-2" title="Remover material">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
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
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-55 transition-colors'
