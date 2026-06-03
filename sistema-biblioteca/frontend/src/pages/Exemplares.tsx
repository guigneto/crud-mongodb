import { useCallback, useEffect, useState, useMemo } from 'react'
import { Copy } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Exemplar, getExemplares, createExemplar, updateExemplar, deleteExemplar } from '../services/exemplares.service'
import { getProdutos, type Produto } from '../services/produtos.service'

type Form = { idProd: string; quantidade?: number }

export default function Exemplares() {
  const [data, setData]       = useState<Exemplar[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Exemplar | undefined>()
  const [produtos, setProdutos] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rE, rP] = await Promise.all([getExemplares(), getProdutos().catch(() => ({ data: [] }))])
      setData(rE.data)
      const pMap: Record<string, string> = {}
      rP.data.forEach((p: Produto) => { pMap[p._id!] = p.dscTituloProd })
      setProdutos(pMap)
    }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase()
    return data.filter((e) => {
      const title = produtos[e.idProd] || String(e.idProd)
      return title.toLowerCase().includes(q)
    })
  }, [data, query, produtos])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(e: Exemplar) { setEditing(e); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteExemplar(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload = { idProd: form.idProd }
    if (editing) {
      await updateExemplar(editing._id!, payload)
    } else {
      const qty = form.quantidade || 1
      const promises = []
      for (let i = 0; i < qty; i++) promises.push(createExemplar(payload))
      await Promise.all(promises)
    }
    close(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exemplares</h1>
          <p className="text-gray-500 mt-1">{data.length} exemplar(es) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className={btn}><Copy size={16} /> Novo Exemplar</button>
      </div>

      <div className="mb-4 max-w-xs"><SearchBar placeholder="Buscar exemplar por livro..." onSearch={setQuery} /></div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum exemplar encontrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left"><Th>#</Th><Th>ID do Produto</Th><Th>Criado em</Th><Th right>Ações</Th></tr></thead>
            <tbody>
              {paginated.map((e, i) => (
                <tr key={e._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{produtos[e.idProd] || e.idProd}</td>
                  <td className="px-4 py-3 text-gray-600">{(e as { createdAt?: string }).createdAt?.slice(0, 10) ?? '—'}</td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Exemplar' : 'Novo Exemplar'}>
        <ExemplarForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function ExemplarForm({ initial, onSubmit, onCancel }: { initial?: Exemplar; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [idProd, setId] = useState(initial ? String(initial.idProd) : '')
  const [quantidade, setQuantidade] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([])

  useEffect(() => {
    getProdutos().then(r => setListaProdutos(r.data)).catch(() => {})
  }, [])

  useEffect(() => { setId(initial ? String(initial.idProd) : ''); setError('') }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!idProd) { setError('ID do produto é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit({ idProd, quantidade }) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Produto <span className="text-red-500">*</span></label>
        <select value={idProd} onChange={(e) => setId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Selecione o livro...</option>
          {listaProdutos.map(p => <option key={p._id} value={p._id}>{p.dscTituloProd}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">Selecione o produto ao qual este exemplar pertence.</p>
      </div>
      {!initial && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade <span className="text-red-500">*</span></label>
          <input type="number" min="1" max="50" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          <p className="text-xs text-gray-400 mt-1">Quantas cópias idênticas deste livro você deseja adicionar ao acervo de uma vez?</p>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={btnSec}>Cancelar</button>
        <button type="submit" disabled={saving} className={btnPri}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 font-medium${right ? ' text-right' : ''}`}>{children}</th>
}

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
