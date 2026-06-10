import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { UserPlus, User, MapPin, Phone, FileText, Star, Mail, ChevronDown, ChevronUp, Filter, BookOpen, History, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import CustomSelect from '../components/CustomSelect'
import TablePagination from '../components/TablePagination'
import { useConfirm } from '../contexts/ConfirmContext'
import { type Associado, type Endereco, getAssociados, createAssociado, updateAssociado, deleteAssociado } from '../services/associados.service'
import { getEmprestimos, type Emprestimo } from '../services/emprestimos.service'
import { getExemplares, type Exemplar } from '../services/exemplares.service'
import { getProdutos, type Produto } from '../services/produtos.service'

const SEXO  = { M: 'Masculino', F: 'Feminino' }
const TIPO  = { comum: 'Comum', vip: 'VIP' }
const tipoBadge = { comum: 'bg-gray-100 text-gray-600', vip: 'bg-purple-100 text-purple-700' }

type Form = { nomAssoc: string; email?: string; telefone?: string; indSexoAssoc: 'M' | 'F'; endereco: Endereco; dscTipoAssoc: 'comum' | 'vip' }
const emptyEndereco: Endereco = { numCEPEnder: '', dscNomeLogradouroEnder: '', numNumeroEnder: '', dscComplementoEnder: '', dscBairroEnder: '', dscCidadeEnder: '', dscUFEnder: '' }
const empty: Form = { nomAssoc: '', email: '', telefone: '', indSexoAssoc: 'M', endereco: emptyEndereco, dscTipoAssoc: 'comum' }

export default function Associados() {
  const [data, setData]       = useState<Associado[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [exemplares, setExemplares] = useState<Exemplar[]>([])
  const [produtos, setProdutos] = useState<Record<string, Produto>>({})
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Associado | undefined>()
  const [viewing, setViewing] = useState<Associado | undefined>()
  const [query, setQuery]     = useState('')
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'comum' | 'vip'>('todos')
  const [page, setPage]       = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { confirm } = useConfirm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resAssoc, resEmpr, resEx, resProd] = await Promise.all([
        getAssociados(), 
        getEmprestimos(),
        getExemplares(),
        getProdutos()
      ])
      setData(resAssoc.data)
      setEmprestimos(resEmpr.data)
      setExemplares(resEx.data)
      
      const pMap: Record<string, Produto> = {}
      resProd.data.forEach((p: Produto) => { pMap[p._id!] = p })
      setProdutos(pMap)
    }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let result = data
    if (tipoFilter !== 'todos') {
      result = result.filter((a) => a.dscTipoAssoc === tipoFilter)
    }
    if (query) {
      const lq = query.toLowerCase()
      result = result.filter((a) => {
        const nom = a.nomAssoc?.toLowerCase() || ''
        const email = a.email?.toLowerCase() || ''
        const tel = a.telefone?.toLowerCase() || ''
        const cod = a.codAssoc?.toLowerCase() || ''
        const id = a._id?.toLowerCase() || ''
        return nom.includes(lq) || email.includes(lq) || tel.includes(lq) || cod.includes(lq) || id.includes(lq)
      })
    }
    return result
  }, [data, query, tipoFilter])

  useEffect(() => { setPage(1) }, [query, tipoFilter, itemsPerPage])

  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, page, itemsPerPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  function openNew()  { setEditing(undefined); setOpen(true) }
  function openEdit(a: Associado) { setEditing(a); setOpen(true) }
  function close()    { setEditing(undefined); setOpen(false) }

  function handleDelete(id: string) {
    confirm({
      title: 'Excluir Associado',
      message: 'Tem certeza que deseja excluir este associado? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      onConfirm: async () => {
        await deleteAssociado(id)
        load()
      }
    })
  }

  async function handleSubmit(form: Form) {
    if (editing) {
      const updated = { ...editing, ...form } as Associado
      await updateAssociado(editing._id!, form)
      setViewing(updated)
    } else {
      await createAssociado(form)
    }
    setEditing(undefined)
    setOpen(false)
    load()
  }
  const totalTodos = data.length;
  const totalComum = data.filter(a => a.dscTipoAssoc === 'comum').length;
  const totalVip   = data.filter(a => a.dscTipoAssoc === 'vip').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Associados</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os membros cadastrados na biblioteca</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <UserPlus size={16} /> Novo Associado
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar placeholder="Buscar Associado" onSearch={setQuery} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-48">
            <CustomSelect
              value={tipoFilter}
              onChange={(v) => setTipoFilter(v as 'todos' | 'comum' | 'vip')}
              options={[
                { value: 'todos', label: `Todos os tipos (${totalTodos})` },
                { value: 'comum', label: `Comum (${totalComum})` },
                { value: 'vip', label: `VIP (${totalVip})` }
              ]}
              className="w-full bg-gray-100 hover:bg-gray-200 border-none rounded-[14px] px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer transition-colors flex justify-between items-center"
            />
          </div>
        </div>
      </div>

      {loading ? <Skeleton /> : !filtered.length
        ? <Empty msg="Nenhum associado cadastrado." />
        : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <Th>#</Th><Th>Código</Th><Th>Associado</Th><Th>E-mail</Th><Th>Telefone</Th><Th>Tipo</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((a, index) => {
                  const rowIndex = (page - 1) * itemsPerPage + index + 1
                  return (
                    <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewing(a)}>
                      <td className={td + ' font-medium text-gray-500 text-xs'}>{rowIndex}</td>
                      <td className={td + ' text-gray-500 font-mono text-xs'}>
                        {a.codAssoc || (a._id ? a._id.slice(-6).toUpperCase() : '')}
                      </td>
                      <td className={td}>
                        <div className="font-medium text-gray-900">{a.nomAssoc}</div>
                      </td>
                      <td className={td + ' text-gray-600'}>
                        {a.email ? <div>{a.email}</div> : <span className="text-gray-400 italic text-xs">Sem e-mail</span>}
                      </td>
                      <td className={td + ' text-gray-600'}>
                        {a.telefone ? <div>{a.telefone}</div> : <span className="text-gray-400 italic text-xs">Sem telefone</span>}
                      </td>
                      <td className={td}>
                        <span className={`inline-block w-16 text-center py-0.5 rounded-full text-xs font-medium ${tipoBadge[a.dscTipoAssoc]}`}>{TIPO[a.dscTipoAssoc]}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length > 0 && (
              <TablePagination
                page={page}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setPage={setPage}
              />
            )}
          </div>
        )}

      <Modal 
        open={open} 
        onClose={close} 
        onBack={editing ? () => { setViewing(editing); close(); } : undefined}
        title={editing ? 'Editar Associado' : 'Novo Associado'}
        maxWidth="max-w-3xl"
      >
        <AssociadoForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>

      <Modal 
        open={!!viewing} 
        onClose={() => setViewing(undefined)} 
        title="Detalhes do Associado" 
        maxWidth="max-w-3xl"
        actions={
          viewing ? (
            <>
              <button onClick={() => { setViewing(undefined); openEdit(viewing); }} className="p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors" title="Editar">
                <Pencil size={18} />
              </button>
              <button onClick={() => { setViewing(undefined); handleDelete(viewing._id!); }} className="p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors" title="Excluir">
                <Trash2 size={18} />
              </button>
            </>
          ) : null
        }
      >
        {viewing && (
          <div className="space-y-6 text-sm">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewing.nomAssoc}</h3>
                <p className="text-gray-500 mt-1">ID: {viewing.codAssoc || viewing._id}</p>
              </div>
              <span className={`inline-block w-16 text-center py-0.5 rounded-full text-xs font-medium ${tipoBadge[viewing.dscTipoAssoc] ?? 'bg-gray-100 text-gray-600'}`}>
                {TIPO[viewing.dscTipoAssoc]}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="block text-gray-500 text-xs mb-1">Email</span>
                <span className="font-medium text-gray-900">{viewing.email || 'Não informado'}</span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Telefone</span>
                <span className="font-medium text-gray-900">{viewing.telefone || 'Não informado'}</span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Endereço Completo</span>
                <span className="font-medium text-gray-900">
                  {viewing.endereco ? (
                    <>
                      {viewing.endereco.dscNomeLogradouroEnder || 'Rua não informada'}, {viewing.endereco.numNumeroEnder || 'S/N'}
                      {viewing.endereco.dscComplementoEnder && ` - ${viewing.endereco.dscComplementoEnder}`}
                      <br />
                      {viewing.endereco.dscBairroEnder || 'Bairro não informado'} - {viewing.endereco.dscCidadeEnder || 'Cidade não informada'}/{viewing.endereco.dscUFEnder || 'UF'}
                      <br />
                      CEP: {viewing.endereco.numCEPEnder || 'Não informado'}
                    </>
                  ) : (
                    'Endereço não cadastrado'
                  )}
                </span>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Sexo</span>
                  <span className="font-medium text-gray-900">{SEXO[viewing.indSexoAssoc]}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Cadastro</span>
                  <span className="font-medium text-gray-900">{viewing.createdAt ? new Date(viewing.createdAt).toLocaleDateString() : 'Não registrado'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              {(() => {
                const ativos = emprestimos.filter(e => e.idAssoc === viewing._id && !e.datEfetEntrEmpr)
                return (
                  <>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500" />
                      Empréstimos Ativos ({ativos.length})
                    </h4>
                    {ativos.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Este associado não possui empréstimos ativos no momento.</p>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-100/50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                              <th className="px-4 py-2 border-b border-gray-200">Livro</th>
                              <th className="px-4 py-2 border-b border-gray-200">Empréstimo</th>
                              <th className="px-4 py-2 border-b border-gray-200">Devolução Prevista</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {ativos.map(empr => {
                              const ex = exemplares.find(e => e._id === empr.idExemplar)
                              const p = ex ? produtos[ex.idProd] : undefined
                              const title = p?.dscTituloProd || 'Livro Desconhecido'
                              const isLate = new Date(empr.datPrevEntrEmpr) < new Date()
                              
                              return (
                                <tr key={empr._id} className="bg-white hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <div className="font-medium text-gray-900">{title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">ID Exemplar: {ex?.codExemplar || ex?._id || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-600">
                                    {new Date(empr.datRetEmpr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className={`font-medium ${isLate ? 'text-rose-600' : 'text-gray-600'}`}>
                                      {new Date(empr.datPrevEntrEmpr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </span>
                                    {isLate && <span className="ml-2 text-[10px] font-bold uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Atrasado</span>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              {(() => {
                const historico = emprestimos.filter(e => e.idAssoc === viewing._id && !!e.datEfetEntrEmpr)
                return (
                  <>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <History size={16} className="text-gray-500" />
                      Histórico de Empréstimos ({historico.length})
                    </h4>
                    {historico.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Nenhum histórico de empréstimo encontrado.</p>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="px-4 py-2 border-b border-gray-200">Livro</th>
                              <th className="px-4 py-2 border-b border-gray-200">Empréstimo</th>
                              <th className="px-4 py-2 border-b border-gray-200">Devolvido em</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {historico.sort((a, b) => new Date(b.datRetEmpr).getTime() - new Date(a.datRetEmpr).getTime()).map(empr => {
                              const ex = exemplares.find(e => e._id === empr.idExemplar)
                              const p = ex ? produtos[ex.idProd] : undefined
                              const title = p?.dscTituloProd || 'Livro Desconhecido'
                              
                              return (
                                <tr key={empr._id} className="bg-white hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <div className="font-medium text-gray-900">{title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">ID Exemplar: {ex?.codExemplar || ex?._id || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-600">
                                    {new Date(empr.datRetEmpr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-600">
                                    {new Date(empr.datEfetEntrEmpr!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  )
}

function AssociadoForm({ initial, onSubmit, onCancel }: { initial?: Associado; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(initial
    ? { nomAssoc: initial.nomAssoc, email: initial.email || '', telefone: initial.telefone || '', indSexoAssoc: initial.indSexoAssoc, endereco: initial.endereco || emptyEndereco, dscTipoAssoc: initial.dscTipoAssoc }
    : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    setForm(initial ? { nomAssoc: initial.nomAssoc, email: initial.email || '', telefone: initial.telefone || '', indSexoAssoc: initial.indSexoAssoc, endereco: initial.endereco || emptyEndereco, dscTipoAssoc: initial.dscTipoAssoc } : empty)
    setError('')
  }, [initial])

  async function handleCEPBlur() {
    const cep = form.endereco.numCEPEnder?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(f => ({
            ...f,
            endereco: {
              ...f.endereco,
              dscNomeLogradouroEnder: data.logradouro || f.endereco.dscNomeLogradouroEnder,
              dscBairroEnder: data.bairro || f.endereco.dscBairroEnder,
              dscCidadeEnder: data.localidade || f.endereco.dscCidadeEnder,
              dscUFEnder: data.uf || f.endereco.dscUFEnder,
            }
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nomAssoc.trim() || !form.endereco.dscNomeLogradouroEnder.trim() || !form.endereco.dscBairroEnder.trim() || !form.endereco.dscCidadeEnder.trim() || !form.endereco.dscUFEnder.trim() || form.endereco.numNumeroEnder === '') { setError('Nome e campos obrigatórios do endereço devem ser preenchidos.'); return }
    if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Informe um e-mail válido.'); return }
    const telDigits = form.telefone?.replace(/\D/g, '') || ''
    if (telDigits.length < 10 || telDigits.length > 11) { setError('Informe um telefone válido com DDD.'); return }
    setSaving(true); setError('')
    try { await onSubmit(form) } catch { setError('Erro ao salvar.') } finally { setSaving(false) }
  }

  const s = (k: keyof Form) => (val: any) => setForm((f) => ({ ...f, [k]: val }))
  const sInp = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col">
      <Section title="Tipo de Cadastro">
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setForm(f => ({ ...f, dscTipoAssoc: 'comum' }))}
            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
              form.dscTipoAssoc === 'comum' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              form.dscTipoAssoc === 'comum' ? 'border-blue-600' : 'border-gray-300'
            }`}>
              {form.dscTipoAssoc === 'comum' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <User className={form.dscTipoAssoc === 'comum' ? 'text-blue-600' : 'text-gray-400'} size={20} />
            <span className={`font-medium ${form.dscTipoAssoc === 'comum' ? 'text-gray-900' : 'text-gray-600'}`}>
              Comum
            </span>
          </div>

          <div 
            onClick={() => setForm(f => ({ ...f, dscTipoAssoc: 'vip' }))}
            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
              form.dscTipoAssoc === 'vip' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              form.dscTipoAssoc === 'vip' ? 'border-blue-600' : 'border-gray-300'
            }`}>
              {form.dscTipoAssoc === 'vip' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <Star className={form.dscTipoAssoc === 'vip' ? 'text-blue-600' : 'text-gray-400'} size={20} />
            <span className={`font-medium ${form.dscTipoAssoc === 'vip' ? 'text-gray-900' : 'text-gray-600'}`}>
              VIP
            </span>
          </div>
        </div>
      </Section>

      <Section icon={FileText} title="Dados Pessoais">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <F label="Nome Completo" required><input value={form.nomAssoc} onChange={sInp('nomAssoc')} className={inp} placeholder="Digite seu nome completo" /></F>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
            <CustomSelect 
              value={form.indSexoAssoc} 
              onChange={s('indSexoAssoc')} 
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' }
              ]}
            />
          </div>
        </div>
      </Section>

      <Section icon={Phone} title="Dados de Contato">
        <div className="grid grid-cols-2 gap-4">
          <F label="E-mail" required>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
              <input type="email" value={form.email || ''} onChange={s('email')} className={`${inp} pl-9`} placeholder="seu.email@exemplo.com" />
            </div>
          </F>
          <F label="Telefone" required>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
              <input value={form.telefone || ''} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 11); let fmt = v; if (v.length > 6) fmt = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`; else if (v.length > 2) fmt = `(${v.slice(0,2)}) ${v.slice(2)}`; else if (v.length > 0) fmt = `(${v}`; setForm(f => ({ ...f, telefone: fmt })) }} maxLength={15} className={`${inp} pl-9`} placeholder="(11) 99999-9999" />
            </div>
          </F>
        </div>
      </Section>

      <Section icon={MapPin} title="Endereço">
        <div className="grid grid-cols-4 gap-4">
          <F label="CEP"><input value={form.endereco.numCEPEnder || ''} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, numCEPEnder: e.target.value } }))} onBlur={handleCEPBlur} className={inp} maxLength={9} placeholder="00000-000" /></F>
          <div className="col-span-3">
            <F label="Logradouro" required><input value={form.endereco.dscNomeLogradouroEnder} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, dscNomeLogradouroEnder: e.target.value } }))} className={inp} placeholder="Rua, Avenida..." /></F>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <F label="Número" required><input type="number" value={form.endereco.numNumeroEnder} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, numNumeroEnder: e.target.value === '' ? '' : Number(e.target.value) } }))} className={inp} placeholder="Ex: 123" /></F>
          <F label="Complemento"><input value={form.endereco.dscComplementoEnder || ''} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, dscComplementoEnder: e.target.value } }))} className={inp} placeholder="Ex: Apto 101" /></F>
          <div className="col-span-2">
            <F label="Bairro" required><input value={form.endereco.dscBairroEnder} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, dscBairroEnder: e.target.value } }))} className={inp} placeholder="Seu bairro" /></F>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="Cidade" required><input value={form.endereco.dscCidadeEnder} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, dscCidadeEnder: e.target.value } }))} className={inp} placeholder="Sua cidade" /></F>
          <F label="Estado" required>
            <StateSelect value={form.endereco.dscUFEnder || ''} onChange={(val) => setForm(f => ({ ...f, endereco: { ...f.endereco, dscUFEnder: val } }))} />
          </F>
        </div>
      </Section>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button type="button" onClick={onCancel} className={`w-full ${btnSec}`}>Cancelar</button>
        <button type="submit" disabled={saving} className={`w-full ${btnPri}`}>{saving ? 'Salvando…' : (initial ? 'Salvar Alterações' : 'Finalizar Cadastro')}</button>
      </div>
    </form>
  )
}

function StateSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(true)
  
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setCanScrollUp(scrollTop > 0)
    setCanScrollDown(Math.ceil(scrollTop + clientHeight) < scrollHeight)
  }, [])

  useEffect(() => {
    if (open) handleScroll()
  }, [open, handleScroll])
  
  const states = [
    { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' }, { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' }, { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' }, { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' }, { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' }, { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
  ]

  const selectedLabel = states.find(s => s.value === value)?.label || 'Selecione o estado'

  return (
    <div className="relative">
      <div 
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={`absolute z-20 w-full bottom-full mb-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto transition-all duration-200 origin-bottom ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {canScrollUp && (
          <div className="sticky top-0 bg-white/95 py-1.5 flex justify-center text-gray-400 z-10 cursor-default">
            <ChevronUp size={16} />
          </div>
        )}
        
        <div className="p-1 space-y-0.5">
          {states.map(s => (
            <div
              key={s.value}
              onClick={() => { onChange(s.value); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer rounded-lg transition-colors ${
                value === s.value 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
        
        {canScrollDown && (
          <div className="sticky bottom-0 bg-white/95 py-1.5 flex justify-center text-gray-400 z-10 cursor-default">
            <ChevronDown size={16} />
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon?: any; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={18} className="text-blue-600" />}
        <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

// ── shared helpers ──────────────────────────────────────────────────────────
// Note: We changed the required asterisk space to match the style in the screenshot.
function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-black ml-1">*</span>}</label>{children}</div>
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
const btnSec = 'px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-55 transition-colors'
