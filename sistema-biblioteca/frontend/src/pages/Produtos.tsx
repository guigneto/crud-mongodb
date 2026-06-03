import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookPlus } from 'lucide-react'
import Modal from '../components/Modal'
import TableActions from '../components/TableActions'
import SearchBar from '../components/SearchBar'
import { type Produto, getProdutos, createProduto, updateProduto, deleteProduto } from '../services/produtos.service'
import { getEditoras, type Editora } from '../services/editoras.service'

const TIPOS = ['livro', 'cd', 'dvd', 'revista', 'jornal', 'nuvem'] as const
const tipoBadge: Record<string, string> = {
  livro: 'bg-indigo-100 text-indigo-700', cd: 'bg-blue-100 text-blue-700',
  dvd: 'bg-purple-100 text-purple-700', revista: 'bg-green-100 text-green-700',
  jornal: 'bg-gray-100 text-gray-600',  nuvem: 'bg-sky-100 text-sky-700',
}

type Form = { dscTituloProd: string; valMultaDiarProd: string; valVendaProd: string; dscTipoProd: typeof TIPOS[number]; dscFormatoProd: '' | 'pdf' | 'video'; idEditora: string }
const empty: Form = { dscTituloProd: '', valMultaDiarProd: '0', valVendaProd: '0', dscTipoProd: 'livro', dscFormatoProd: '', idEditora: '' }

export default function Produtos() {
  const [data, setData]       = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [page, setPage]       = useState(1)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Produto | undefined>()
  const [editoras, setEditoras] = useState<Record<string, string>>({})
  const ITEMS_PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rP, rE] = await Promise.all([getProdutos(), getEditoras().catch(() => ({ data: [] }))])
      setData(rP.data)
      const eMap: Record<string, string> = {}
      rE.data.forEach((ed: Editora) => { eMap[ed._id!] = ed.dscEditora })
      setEditoras(eMap)
    }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase()
    return data.filter((p) => {
      const title = p.dscTituloProd.toLowerCase()
      const type = p.dscTipoProd.toLowerCase()
      const format = (p.dscFormatoProd || '').toLowerCase()
      const ed = (editoras[p.idEditora] || p.idEditora).toLowerCase()
      const authors = p.autores ? p.autores.map(a => a.nomAutor).join(' ').toLowerCase() : ''
      return title.includes(q) || type.includes(q) || format.includes(q) || ed.includes(q) || authors.includes(q)
    })
  }, [data, query, editoras])

  useEffect(() => { setPage(1) }, [query])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(p: Produto) { setEditing(p); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  async function handleDelete(id: string) {
    if (!confirm('Confirma exclusão?')) return
    await deleteProduto(id); load()
  }

  async function handleSubmit(form: Form) {
    const payload: Omit<Produto, '_id'> = {
      dscTituloProd:    form.dscTituloProd,
      valMultaDiarProd: Number(form.valMultaDiarProd),
      valVendaProd:     Number(form.valVendaProd),
      dscTipoProd:      form.dscTipoProd,
      dscFormatoProd:   form.dscFormatoProd || null,
      idEditora:        form.idEditora,
    }
    if (editing) await updateProduto(editing._id!, payload)
    else await createProduto(payload)
    close(); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 mt-1">{data.length} item(ns) no acervo</p>
        </div>
        <button onClick={openNew} className={btn}><BookPlus size={16} /> Novo Produto</button>
      </div>

      <div className="mb-4 max-w-sm"><SearchBar placeholder="Buscar por título, autor, tipo, editora…" onSearch={setQuery} /></div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum produto cadastrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <Th>Título</Th><Th>Tipo</Th><Th>Multa Diária</Th><Th>Valor Venda</Th><Th>Editora</Th><Th right>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.dscTituloProd}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${tipoBadge[p.dscTipoProd] ?? 'bg-gray-100 text-gray-600'}`}>{p.dscTipoProd}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">R$ {p.valMultaDiarProd.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">R$ {p.valVendaProd.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{editoras[p.idEditora] || p.idEditora}</td>
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

      <Modal open={open} onClose={close} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <ProdutoForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}

function ProdutoForm({ initial, onSubmit, onCancel }: { initial?: Produto; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { dscTituloProd: initial.dscTituloProd, valMultaDiarProd: String(initial.valMultaDiarProd), valVendaProd: String(initial.valVendaProd), dscTipoProd: initial.dscTipoProd, dscFormatoProd: initial.dscFormatoProd ?? '', idEditora: String(initial.idEditora) }
    : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [editoras, setEditoras] = useState<Editora[]>([])

  useEffect(() => {
    getEditoras().then(r => setEditoras(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setForm(initial
      ? { dscTituloProd: initial.dscTituloProd, valMultaDiarProd: String(initial.valMultaDiarProd), valVendaProd: String(initial.valVendaProd), dscTipoProd: initial.dscTipoProd, dscFormatoProd: initial.dscFormatoProd ?? '', idEditora: String(initial.idEditora) }
      : empty)
    setError('')
  }, [initial])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.dscTituloProd.trim()) { setError('Título é obrigatório.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <F label="Título" required><input value={form.dscTituloProd} onChange={s('dscTituloProd')} className={inp} /></F>
      <div className="grid grid-cols-2 gap-4">
        <F label="Tipo" required>
          <select value={form.dscTipoProd} onChange={s('dscTipoProd')} className={sel}>
            {TIPOS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </F>
        <F label="Formato">
          <select value={form.dscFormatoProd} onChange={s('dscFormatoProd')} className={sel}>
            <option value="">Nenhum</option>
            <option value="pdf">PDF</option>
            <option value="video">Vídeo</option>
          </select>
        </F>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <F label="Valor de Venda (R$)"><input type="number" min="0" step="0.01" value={form.valVendaProd} onChange={s('valVendaProd')} className={inp} /></F>
        <F label="Multa Diária (R$)"><input type="number" min="0" step="0.01" value={form.valMultaDiarProd} onChange={s('valMultaDiarProd')} className={inp} /></F>
      </div>
      <F label="Editora" required>
        <select value={form.idEditora} onChange={s('idEditora')} className={sel}>
          <option value="">Selecione uma editora...</option>
          {editoras.map(ed => <option key={ed._id} value={ed._id}>{ed.dscEditora}</option>)}
        </select>
      </F>
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
