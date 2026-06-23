import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookPlus, BookOpen, Tag, DollarSign, Copy, Newspaper, Disc, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import CustomSelect from '../components/CustomSelect'
import MultiSelect from '../components/MultiSelect'
import ColumnFilter from '../components/ColumnFilter'
import ColumnMultiFilter from '../components/ColumnMultiFilter'
import TablePagination from '../components/TablePagination'
import { useConfirm } from '../contexts/ConfirmContext'
import { type Produto, getProdutos, createProduto, updateProduto, deleteProduto } from '../services/produtos.service'
import { getEditoras, type Editora, createEditora } from '../services/editoras.service'
import { getAutores, type Autor, createAutor } from '../services/autores.service'
import { getExemplares, type Exemplar, createExemplar, deleteExemplar } from '../services/exemplares.service'
import { getEmprestimos, type Emprestimo } from '../services/emprestimos.service'
import { getAssociados, type Associado } from '../services/associados.service'
import { formatDateBR, formatToDateInput, maskDateInput, formatToISO } from '../utils/date'

const TIPOS = ['livro', 'cd', 'dvd', 'revista', 'jornal', 'nuvem', 'mapa', 'audiobook', 'software', 'outro'] as const
const tipoBadge: Record<string, string> = {
  livro: 'bg-indigo-100 text-indigo-700', cd: 'bg-blue-100 text-blue-700',
  dvd: 'bg-purple-100 text-purple-700', revista: 'bg-emerald-100 text-emerald-700',
  jornal: 'bg-amber-100 text-amber-700',  nuvem: 'bg-sky-100 text-sky-700',
  mapa: 'bg-blue-100 text-blue-700', audiobook: 'bg-rose-100 text-rose-700',
  software: 'bg-teal-100 text-teal-700', outro: 'bg-gray-100 text-gray-600',
}

function normalizeStr(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(dateVal: any): string {
  return formatDateBR(dateVal)
}


function getTipoLabel(tipo: string): string {
  if (tipo === 'cd') return 'CD';
  if (tipo === 'dvd') return 'DVD';
  if (tipo === 'audiobook') return 'Audiobook';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function getTipoLabelPlural(tipo: string): string {
  if (tipo === 'cd') return 'CDs';
  if (tipo === 'dvd') return 'DVDs';
  if (tipo === 'jornal') return 'Jornais';
  if (tipo === 'nuvem') return 'Produtos em Nuvem';
  if (tipo === 'mapa') return 'Mapas';
  if (tipo === 'audiobook') return 'Audiobooks';
  if (tipo === 'software') return 'Softwares';
  if (tipo === 'outro') return 'Outros';
  return getTipoLabel(tipo) + 's';
}

const CATEGORIAS_LIVRO = ['Fantasia', 'Romance', 'Suspense', 'Literatura Brasileira', 'Ficção Científica', 'História', 'Ciências', 'Literatura Infantil', 'Literatura Latino-americana', 'Literatura Clássica', 'Tecnologia'];
const CATEGORIAS_PERIODICO = ['Notícias', 'Ciência & Tecnologia', 'Esportes', 'Moda & Estilo', 'Política & Economia', 'Cultura & Entretenimento', 'Saúde'];
const CATEGORIAS_CD = ['Música Clássica', 'Instrumental', 'Rock', 'Pop', 'Jazz & Blues', 'MPB', 'Trilha Sonora'];
const CATEGORIAS_DVD = ['Ação & Aventura', 'Comédia', 'Drama', 'Ficção Científica', 'Suspense & Terror', 'Documentário', 'Infantil', 'Show / Musical'];
const CATEGORIAS_AUDIOBOOK = ['Ficção', 'Não-Ficção', 'Autoajuda', 'Negócios & Carreira', 'Biografia'];
const CATEGORIAS_OUTROS = ['Utilitário', 'Educacional', 'Produtividade', 'Entretenimento', 'Informação / Referência'];

function getCategoriasList(tipo: string): string[] {
  if (tipo === 'livro') return CATEGORIAS_LIVRO;
  if (tipo === 'revista' || tipo === 'jornal') return CATEGORIAS_PERIODICO;
  if (tipo === 'cd') return CATEGORIAS_CD;
  if (tipo === 'dvd') return CATEGORIAS_DVD;
  if (tipo === 'audiobook') return CATEGORIAS_AUDIOBOOK;
  return CATEGORIAS_OUTROS;
}

function getEditoraLabel(tipo: string): string {
  if (tipo === 'revista' || tipo === 'jornal') return 'Editor';
  if (tipo === 'cd') return 'Gravadora';
  if (tipo === 'dvd') return 'Produtora / Estúdio';
  if (tipo === 'software') return 'Desenvolvedor / Fabricante';
  if (tipo === 'audiobook' || tipo === 'nuvem') return 'Produtora / Editora';
  return 'Editora';
}

function getCategoriaLabel(tipo: string): string {
  if (tipo === 'revista' || tipo === 'jornal') return 'Tema';
  if (tipo === 'cd' || tipo === 'dvd' || tipo === 'audiobook') return 'Gênero';
  return 'Categoria';
}

type Form = { codProd: string; dscTituloProd: string; valPrecoProd: string; valMultaDiarProd: string; dscTipoProd: typeof TIPOS[number]; dscFormatoProd: '' | 'pdf' | 'video'; idEditora: string; idAutor: string; autores?: any[]; qtdExemplares?: string; numAnoPublProd: string; numISBNProd: string; dscCategoriaProd: string[] }
const empty: Form = { codProd: '', dscTituloProd: '', valPrecoProd: '0.00', valMultaDiarProd: '1.00', dscTipoProd: 'livro', dscFormatoProd: '', idEditora: '', idAutor: '', qtdExemplares: '1', numAnoPublProd: '', numISBNProd: '', dscCategoriaProd: [] }
const getMultaForTipo = (tipo: string) => {
  if (['cd', 'dvd'].includes(tipo)) return '2.00';
  if (['nuvem', 'audiobook', 'software'].includes(tipo)) return '0.00';
  return '1.00';
}

export default function Produtos() {
  const [data, setData]       = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [tiposFilter, setTiposFilter] = useState<string[]>([])
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todas')
  const [disponibilidadeFilter, setDisponibilidadeFilter] = useState<'todos' | 'disponivel' | 'indisponivel'>('todos')
  const [exemplares, setExemplares] = useState<Exemplar[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [page, setPage]       = useState(1)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Produto | undefined>()
  const [viewing, setViewing] = useState<Produto | undefined>()
  const [editoras, setEditoras] = useState<Record<string, string>>({})
  const [associadosMap, setAssociadosMap] = useState<Record<string, string>>({})
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [exemplarSaving, setExemplarSaving] = useState(false)
  const { confirm } = useConfirm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rP, rE, rEx, rEmp, rAssoc] = await Promise.all([
        getProdutos(),
        getEditoras().catch(() => ({ data: [] })),
        getExemplares().catch(() => ({ data: [] })),
        getEmprestimos().catch(() => ({ data: [] })),
        getAssociados().catch(() => ({ data: [] }))
      ])
      setData(rP.data)
      const eMap: Record<string, string> = {}
      rE.data.forEach((ed: Editora) => { eMap[ed._id!] = ed.dscEditora })
      setEditoras(eMap)
      
      const aMap: Record<string, string> = {}
      rAssoc.data.forEach((a: Associado) => { aMap[a._id!] = a.nomAssoc })
      setAssociadosMap(aMap)

      setExemplares(rEx.data)
      setEmprestimos(rEmp.data)
    }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>()
    data.forEach(p => {
      if (p.dscTipoProd === 'livro' && p.dscCategoriaProd) {
        p.dscCategoriaProd.forEach(c => cats.add(c))
      }
    })
    return Array.from(cats).sort()
  }, [data])

  const filtered = useMemo(() => {
    let result = data

    // Filter by type
    if (tiposFilter.length > 0) {
      result = result.filter(p => {
        if (p.dscTipoProd === 'livro') return tiposFilter.includes('livro');
        if (p.dscTipoProd === 'revista' || p.dscTipoProd === 'jornal') return tiposFilter.includes('periodico');
        return tiposFilter.includes('outros');
      })
    }

    // Filter by category (only if 'livro' is selected or no type filter)
    if ((tiposFilter.length === 0 || tiposFilter.includes('livro')) && categoriaFilter !== 'todas') {
      result = result.filter(p => p.dscCategoriaProd && p.dscCategoriaProd.includes(categoriaFilter))
    }

    // Filter by availability
    if (disponibilidadeFilter !== 'todos') {
      result = result.filter(p => {
        if (p.dscTipoProd === 'nuvem' || p.dscTipoProd === 'audiobook') {
          return disponibilidadeFilter === 'disponivel';
        }
        const pEx = exemplares.filter(ex => ex.idProd === p._id && ex.estado !== 'Vendido');
        const available = pEx.filter(exemplar => exemplar.dscStatusExemplar === 'Disponível').length;

        if (disponibilidadeFilter === 'disponivel') {
          return available > 0;
        }
        if (disponibilidadeFilter === 'indisponivel') {
          return available === 0;
        }
        return true;
      });
    }

    if (query) {
      const q = normalizeStr(query)
      const qCleanDigits = query.replace(/\D/g, '')
      
      result = result.filter((p) => {
        try {
          const title = normalizeStr(p.dscTituloProd)
          const type = normalizeStr(p.dscTipoProd)
          const format = normalizeStr(p.dscFormatoProd || '')
          const ed = normalizeStr(editoras[p.idEditora] || p.idEditora)
          const authors = p.autores ? p.autores.map(a => normalizeStr(a.nomAutor || '')).join(' ') : ''
          const category = p.dscCategoriaProd ? p.dscCategoriaProd.map(c => normalizeStr(c)).join(' ') : ''
          const isbn = normalizeStr(p.numISBNProd || '')
          const isbnCleanDigits = (p.numISBNProd || '').replace(/\D/g, '')
          const year = p.numAnoPublProd ? formatDate(p.numAnoPublProd) : ''
          const cod = normalizeStr(p.codProd || p._id || '')
          
          let dispText = '';
          if (p.dscTipoProd === 'nuvem' || p.dscTipoProd === 'audiobook') {
            dispText = 'disponível digital';
          } else {
            const pEx = exemplares.filter(ex => ex.idProd === p._id && ex.dscStatusExemplar !== 'Vendido')
            const total = pEx.length
            // const activeLoans = emprestimos.filter(em => 
            //   em.status !== 'cancelado' && !em.datEfetEntrEmpr && 
            //   pEx.some(ex => ex._id === em.idExemplar)
            // )
            const available = pEx.filter(exemplar => exemplar.dscStatusExemplar === 'Disponível').length;
            if (total === 0) dispText = 'sem exemplares';
            else if (available > 0) dispText = 'disponível';
          }
          dispText = normalizeStr(dispText);

          const matchesISBN = qCleanDigits && isbnCleanDigits.includes(qCleanDigits)
          
          return (
            title.includes(q) ||
            cod.includes(q) ||
            type.includes(q) ||
            format.includes(q) ||
            ed.includes(q) ||
            authors.includes(q) ||
            category.includes(q) ||
            isbn.includes(q) ||
            matchesISBN ||
            year.includes(q) ||
            dispText.includes(q)
          )
        } catch (e) {
          console.error("Erro ao filtrar produto:", p, e)
          return false
        }
      })
    }
    return result
  }, [data, query, editoras, tiposFilter, categoriaFilter, disponibilidadeFilter, exemplares, emprestimos])

  useEffect(() => { setPage(1) }, [query, tiposFilter, categoriaFilter, disponibilidadeFilter, itemsPerPage])

  const paginated = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, page, itemsPerPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  function openNew() { setEditing(undefined); setOpen(true) }
  function openEdit(p: Produto) { setEditing(p); setOpen(true) }
  function close() { setEditing(undefined); setOpen(false) }

  function handleDelete(id: string) {
    confirm({
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e pode afetar exemplares e empréstimos.',
      confirmText: 'Excluir',
      onConfirm: async () => {
        await deleteProduto(id)
        load()
      }
    })
  }

  async function handleSubmit(form: Form) {
    const payload: Omit<Produto, '_id'> = {
      codProd:          form.codProd,
      dscTituloProd:    form.dscTituloProd,
      valPrecoProd:     Number(form.valPrecoProd),
      valMultaDiarProd: Number(form.valMultaDiarProd),
      dscTipoProd:      form.dscTipoProd,
      dscFormatoProd:   form.dscFormatoProd || null,
      idEditora:        form.idEditora,
      numAnoPublProd:   form.numAnoPublProd ? new Date(form.numAnoPublProd).toISOString() : null,
      numISBNProd:      form.numISBNProd.trim() || null,
      dscCategoriaProd: form.dscCategoriaProd,
      autores:          form.autores || [],
    }
    if (editing) {
      const updated = { ...editing, ...payload } as Produto
      await updateProduto(editing._id!, payload)
      setViewing(updated)
    } else {
      const res = await createProduto(payload)
      const prodId = res.data._id
      const isDigital = form.dscTipoProd === 'nuvem' || form.dscTipoProd === 'audiobook'
      const qty = isDigital ? 0 : (Number(form.qtdExemplares) || 0)
      if (prodId && qty > 0) {
        for (let i = 0; i < qty; i++) {
          // await each criação para evitar condição de corrida no servidor
          // ao gerar o `codExemplar` único.
          // eslint-disable-next-line no-await-in-loop
          await createExemplar({ idProd: prodId })
        }
      }
    }
    close(); load()
  }

  const searchPlaceholder = 'Buscar Produto'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie o acervo de livros e publicações</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <BookPlus size={16} /> Novo Produto
        </button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar placeholder={searchPlaceholder} onSearch={setQuery} variant="default" />
        </div>
      </div>

      {loading ? <Skeleton /> : !filtered.length ? <p className="text-center text-gray-400 py-16">Nenhum produto cadastrado.</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <Th>#</Th>
                <Th>Código</Th>
                <Th>Produto</Th>
                <Th>Preço</Th>
                <Th>Lançamento</Th>
                <Th>
                  <ColumnMultiFilter
                    title="Tipo"
                    value={tiposFilter}
                    onChange={(val) => {
                      setTiposFilter(val)
                      setCategoriaFilter('todas')
                    }}
                    options={[
                      { value: 'livro', label: 'Livros' },
                      { value: 'periodico', label: 'Periódicos' },
                      { value: 'outros', label: 'Outros Materiais' }
                    ]}
                  />
                </Th>
                <Th>
                  <ColumnFilter
                    title="Disponibilidade"
                    value={disponibilidadeFilter}
                    onChange={(val) => setDisponibilidadeFilter(val as any)}
                    options={[
                      { value: 'todos', label: 'Todas' },
                      { value: 'disponivel', label: 'Disponível' },
                      { value: 'indisponivel', label: 'Indisponível' }
                    ]}
                    defaultOption="todos"
                  />
                </Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, index) => {
                const rowIndex = (page - 1) * itemsPerPage + index + 1
                return (
                  <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewing(p)}>
                    <td className="px-4 py-3 font-medium text-gray-500 text-xs">
                      {rowIndex}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {p.codProd || (p._id ? p._id.slice(-6).toUpperCase() : '')}
                    </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.dscTituloProd}</div>
                    <div className="text-xs text-gray-400 mt-0.5 font-normal">
                      {p.autores && p.autores.length > 0 && (
                        <span> • Por {p.autores.map(a => a.nomAutor).join(', ')}</span>
                      )}
                      {p.numISBNProd && (
                        <span> • {p.dscTipoProd === 'revista' || p.dscTipoProd === 'jornal' ? 'ISSN' : 'ISBN'}: {p.numISBNProd}</span>
                      )}
                      {p.idEditora && (
                        <span> • Editora: {editoras[p.idEditora] || p.idEditora}</span>
                      )}
                      {p.dscCategoriaProd && p.dscCategoriaProd.length > 0 && (
                        <span> • Gênero: {p.dscCategoriaProd.join(', ')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {p.numAnoPublProd ? formatDate(p.numAnoPublProd) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block w-24 text-center py-0.5 rounded-full text-xs font-medium ${tipoBadge[p.dscTipoProd] ?? 'bg-gray-100 text-gray-600'}`}>{getTipoLabel(p.dscTipoProd)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      if (p.dscTipoProd === 'nuvem' || p.dscTipoProd === 'audiobook') {
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                            Disponível (Digital)
                          </span>
                        )
                      }
                      const pEx = exemplares.filter(ex => ex.idProd === p._id)
                      const total = pEx.length
                      // const activeLoans = emprestimos.filter(em => 
                      //   em.status !== 'cancelado' && !em.datEfetEntrEmpr && 
                      //   pEx.some(ex => ex._id === em.idExemplar)
                      // )
                      const available = pEx.filter(exemplar => exemplar.dscStatusExemplar === 'Disponível').length;
                      if (total === 0) {
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                            Sem exemplares
                          </span>
                        )
                      }
                      if (available > 0) {
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Disponível ({available}/{total})
                          </span>
                        )
                      }
                      return (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Disponível ({available}/{total})
                        </span>
                      )
                    })()}
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
        title={editing ? 'Editar Produto' : 'Cadastrar Produto'} 
        maxWidth="max-w-4xl"
      >
        <ProdutoForm initial={editing} existingProducts={data} onSubmit={handleSubmit} onCancel={close} />
      </Modal>

      <Modal 
        open={!!viewing} 
        onClose={() => setViewing(undefined)} 
        title="Detalhes do Produto" 
        maxWidth="max-w-4xl"
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
                <h3 className="text-xl font-bold text-gray-900">{viewing.dscTituloProd}</h3>
                <p className="text-gray-500 mt-1">ID: {viewing.codProd || viewing._id}</p>
              </div>
              <span className={`inline-block w-24 text-center py-0.5 rounded-full text-xs font-medium ${tipoBadge[viewing.dscTipoProd] ?? 'bg-gray-100 text-gray-600'}`}>
                {getTipoLabel(viewing.dscTipoProd)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="block text-gray-500 text-xs mb-1">Autores</span>
                <span className="font-medium text-gray-900">
                  {viewing.autores && viewing.autores.length > 0 ? viewing.autores.map(a => a.nomAutor).join(', ') : 'Não informado'}
                </span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Editora / Produtora</span>
                <span className="font-medium text-gray-900">{viewing.idEditora ? (editoras[viewing.idEditora] || viewing.idEditora) : 'Não informada'}</span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Categoria / Gênero</span>
                <span className="font-medium text-gray-900">{viewing.dscCategoriaProd?.length ? viewing.dscCategoriaProd.join(', ') : 'Não informada'}</span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Data de Lançamento / Publicação</span>
                <span className="font-medium text-gray-900">{viewing.numAnoPublProd ? formatDate(viewing.numAnoPublProd) : 'Não informada'}</span>
              </div>
              
              {viewing.dscTipoProd === 'livro' && (
                <div>
                  <span className="block text-gray-500 text-xs mb-1">ISBN</span>
                  <span className="font-medium text-gray-900">{viewing.numISBNProd || 'Não informado'}</span>
                </div>
              )}
              
              {(viewing.dscTipoProd === 'revista' || viewing.dscTipoProd === 'jornal') && (
                <div>
                  <span className="block text-gray-500 text-xs mb-1">ISSN</span>
                  <span className="font-medium text-gray-900">{viewing.numISBNProd || 'Não informado'}</span>
                </div>
              )}
              
              {viewing.dscFormatoProd && (
                <div>
                  <span className="block text-gray-500 text-xs mb-1">Formato Digital</span>
                  <span className="font-medium text-gray-900 uppercase">{viewing.dscFormatoProd}</span>
                </div>
              )}
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">Preço de Venda</span>
                <span className="font-medium text-gray-900">R$ {viewing.valPrecoProd?.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Multa Diária (Atraso)</span>
                <span className="font-medium text-gray-900">R$ {viewing.valMultaDiarProd.toFixed(2)}</span>
              </div>
            </div>
            
            {viewing.dscTipoProd !== 'nuvem' && viewing.dscTipoProd !== 'audiobook' && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h4 className="font-bold text-gray-900">Exemplares e Disponibilidade</h4>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!viewing?._id) return
                      setExemplarSaving(true)
                      try {
                        await createExemplar({ idProd: viewing._id })
                        await load()
                      } finally {
                        setExemplarSaving(false)
                      }
                    }}
                    disabled={exemplarSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-blue-200"
                  >
                    <BookPlus size={14} /> Adicionar exemplar
                  </button>
                </div>
                {(() => {
                  const pEx = exemplares.filter(ex => ex.idProd === viewing._id)
                  if (pEx.length === 0) {
                    return <p className="text-gray-500 italic">Nenhum exemplar físico registrado para este produto.</p>
                  }
                  return (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100/50 text-gray-500 text-xs uppercase font-medium">
                          <tr>
                            <th className="px-4 py-2 border-b border-gray-200">ID Exemplar</th>
                            <th className="px-4 py-2 border-b border-gray-200">Estado Físico</th>
                            <th className="px-4 py-2 border-b border-gray-200 w-28">Status</th>
                            <th className="px-4 py-2 border-b border-gray-200">Detalhes</th>
                            <th className="px-4 py-2 border-b border-gray-200 w-28">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pEx.map(ex => {
                            const activeLoan = emprestimos.find(em => em.status !== 'cancelado' && !em.datEfetEntrEmpr && em.idExemplar === ex._id)
                            const canDelete = !!ex._id && !activeLoan
                            return (
                              <tr key={ex._id} className="bg-white">
                                <td className="px-4 py-2.5 font-mono text-gray-600 text-xs">{ex.codExemplar || ex._id}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-block w-20 text-center py-0.5 rounded text-[10px] font-semibold border ${
                                    ex.estado === 'Excelente' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    ex.estado === 'Bom' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    ex.estado === 'Danificado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    ex.estado === 'Perdido' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                    {ex.estado || 'Excelente'}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-block w-20 text-center py-0.5 rounded-full text-[10px] font-semibold border ${
                                    ex.dscStatusExemplar === 'Vendido' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                    ex.dscStatusExemplar === 'Emprestado' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {ex.dscStatusExemplar || 'Disponível'}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-gray-500">
                                  {activeLoan ? (
                                    <>
                                      Para <span className="font-medium text-gray-700">{associadosMap[activeLoan.idAssoc] || activeLoan.idAssoc}</span>
                                      <br />
                                      Devolução: {formatDate(activeLoan.datPrevEntrEmpr)}
                                    </>
                                  ) : (
                                    'Pronto para empréstimo'
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      if (!ex._id) return
                                      setExemplarSaving(true)
                                      try {
                                        await deleteExemplar(ex._id)
                                        await load()
                                      } finally {
                                        setExemplarSaving(false)
                                      }
                                    }}
                                    disabled={!canDelete || exemplarSaving}
                                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                  >
                                    <Trash2 size={12} /> Remover
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                })()}
              </div>
            )}
            
          </div>
        )}
      </Modal>
    </div>
  )
}
function ProdutoForm({ initial, existingProducts, onSubmit, onCancel }: { initial?: Produto; existingProducts: Produto[]; onSubmit: (f: Form) => Promise<void>; onCancel: () => void }) {
  const getMaterialTypeFromTipoProd = (tipo: string): 'livro' | 'periodico' | 'outros' => {
    if (tipo === 'livro') return 'livro';
    if (tipo === 'revista' || tipo === 'jornal') return 'periodico';
    return 'outros';
  };

  const getInitialDateStr = (dateVal: any): string => {
    if (!dateVal) return '';
    const formatted = formatToDateInput(dateVal);
    return formatted;
  };

  const getNextId = useCallback((materialType: 'livro' | 'periodico' | 'outros') => {
    const prefix = materialType === 'livro' ? 'L' : (materialType === 'periodico' ? 'P' : 'M');
    const codes = existingProducts
      .map(p => p.codProd)
      .filter(c => c && c.startsWith(`${prefix}-`)) as string[];
    let maxNum = 0;
    codes.forEach(c => {
      const parts = c.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `${prefix}-${String(maxNum + 1).padStart(5, '0')}`;
  }, [existingProducts]);

  const [materialType, setMaterialType] = useState<'livro' | 'periodico' | 'outros'>(
    initial ? getMaterialTypeFromTipoProd(initial.dscTipoProd) : 'livro'
  )

  const [form, setForm] = useState<Form>(() => {
    if (initial) {
      return {
        codProd: initial.codProd || '',
        dscTituloProd: initial.dscTituloProd,
        valPrecoProd: String(initial.valPrecoProd ?? 0),
        valMultaDiarProd: String(initial.valMultaDiarProd),
        dscTipoProd: initial.dscTipoProd,
        dscFormatoProd: initial.dscTipoProd === 'nuvem' ? (initial.dscFormatoProd ?? '') : '',
        idEditora: String(initial.idEditora),
        idAutor: initial.autores && initial.autores.length > 0 ? String(initial.autores[0].idAutor) : '',
        qtdExemplares: '0',
        numAnoPublProd: getInitialDateStr(initial.numAnoPublProd),
        numISBNProd: initial.numISBNProd ?? '',
        dscCategoriaProd: initial.dscCategoriaProd || []
      };
    }
    return {
      ...empty,
      codProd: getNextId('livro'),
      dscTipoProd: 'livro'
    };
  });

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [editoras, setEditoras] = useState<Editora[]>([])
  const [autores, setAutores] = useState<Autor[]>([])

  const loadDependencies = useCallback(async () => {
    try {
      const [resEd, resAu] = await Promise.all([getEditoras(), getAutores()])
      setEditoras(resEd.data)
      setAutores(resAu.data)
    } catch {}
  }, [])

  useEffect(() => {
    loadDependencies()
  }, [loadDependencies])

  useEffect(() => {
    const defaultMaterialType = initial ? getMaterialTypeFromTipoProd(initial.dscTipoProd) : 'livro';
    setMaterialType(defaultMaterialType);
    
    setForm(initial
      ? {
          codProd: initial.codProd || '',
          dscTituloProd: initial.dscTituloProd,
          valPrecoProd: String(initial.valPrecoProd ?? 0),
          valMultaDiarProd: String(initial.valMultaDiarProd),
          dscTipoProd: initial.dscTipoProd,
          dscFormatoProd: initial.dscTipoProd === 'nuvem' ? (initial.dscFormatoProd ?? '') : '',
          idEditora: String(initial.idEditora),
          idAutor: initial.autores && initial.autores.length > 0 ? String(initial.autores[0].idAutor) : '',
          qtdExemplares: '0',
          numAnoPublProd: getInitialDateStr(initial.numAnoPublProd),
          numISBNProd: initial.numISBNProd ?? '',
          dscCategoriaProd: initial.dscCategoriaProd || []
        }
      : {
          ...empty,
          codProd: getNextId('livro'),
          dscTipoProd: 'livro',
          valPrecoProd: '0.00',
          valMultaDiarProd: '1.00'
        });
    setError('')
  }, [initial, getNextId])

  const handleMaterialTypeChange = (type: 'livro' | 'periodico' | 'outros') => {
    if (initial) return;
    setMaterialType(type);
    const newTipoProd = type === 'livro' ? 'livro' : (type === 'periodico' ? 'revista' : 'cd');
    const newCodProd = getNextId(type);
    setForm(f => ({
      ...f,
      dscTipoProd: newTipoProd,
      codProd: newCodProd,
      valMultaDiarProd: getMultaForTipo(newTipoProd)
    }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.dscTituloProd.trim()) { setError('Título é obrigatório.'); return }
    if (!form.idEditora) {
      setError(`${getEditoraLabel(form.dscTipoProd)} é obrigatório(a).`);
      return;
    }
    if (form.dscTipoProd === 'livro' && !form.numISBNProd.trim()) {
      setError('ISBN é obrigatório para livros.');
      return;
    }
    if (materialType === 'periodico' && !form.numISBNProd.trim()) {
      setError('ISSN é obrigatório para periódicos.');
      return;
    }
    const isDigital = form.dscTipoProd === 'nuvem' || form.dscTipoProd === 'audiobook';
    if (!initial && !isDigital && (Number(form.qtdExemplares) < 1 || isNaN(Number(form.qtdExemplares)))) {
      setError('A biblioteca possui pelo menos um exemplar de cada produto. Quantidade deve ser no mínimo 1.');
      return;
    }
    
    setSaving(true); setError('')
    try {
      let finalAutores = []
      if (form.idAutor) {
        const autorFound = autores.find(a => a._id === form.idAutor)
        if (autorFound) finalAutores.push({ idAutor: autorFound._id, nomAutor: autorFound.nome })
      }
      
      const formToSubmit = {
        ...form,
        autores: finalAutores as any,
        numAnoPublProd: formatToISO(form.numAnoPublProd)
      };
      await onSubmit(formToSubmit)
    } catch {
      setError('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const s = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const sDate = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDateInput(e.target.value);
    setForm((f) => ({ ...f, [k]: masked }));
  };

  const handleTipoChange = (val: typeof TIPOS[number]) => {
    setForm((f) => ({
      ...f,
      dscTipoProd: val,
      dscFormatoProd: val === 'nuvem' ? f.dscFormatoProd : '',
      valMultaDiarProd: getMultaForTipo(val)
    }));
  };

  const isNuvem = form.dscTipoProd === 'nuvem';
  const isCDorDVD = form.dscTipoProd === 'cd' || form.dscTipoProd === 'dvd';

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col">
        <Section title="Tipo de Material">
          <div className="grid grid-cols-3 gap-4">
            <div 
              onClick={() => handleMaterialTypeChange('livro')}
              className={`flex flex-col items-center gap-2.5 p-4 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                initial ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                materialType === 'livro' 
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600 font-semibold' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              <BookOpen className={materialType === 'livro' ? 'text-blue-600' : 'text-gray-400'} size={24} />
              <span className="text-sm">Livro</span>
            </div>

            <div 
              onClick={() => handleMaterialTypeChange('periodico')}
              className={`flex flex-col items-center gap-2.5 p-4 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                initial ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                materialType === 'periodico' 
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600 font-semibold' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              <Newspaper className={materialType === 'periodico' ? 'text-blue-600' : 'text-gray-400'} size={24} />
              <span className="text-sm">Periódico</span>
            </div>

            <div 
              onClick={() => handleMaterialTypeChange('outros')}
              className={`flex flex-col items-center gap-2.5 p-4 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                initial ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                materialType === 'outros' 
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600 font-semibold' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-500 hover:text-gray-700 font-medium'
              }`}
            >
              <Disc className={materialType === 'outros' ? 'text-blue-600' : 'text-gray-400'} size={24} />
              <span className="text-sm">Outros Materiais</span>
            </div>
          </div>
        </Section>

        <Section icon={BookOpen} title="Informações Gerais">
          {initial ? (
            <div className="grid grid-cols-4 gap-4">
              <F label="ID">
                <input value={form.codProd} disabled className={`${inp} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed select-none font-medium`} />
              </F>
              <div className="col-span-3">
                <F label="Título" required>
                  <input value={form.dscTituloProd} onChange={s('dscTituloProd')} className={inp} placeholder="Digite o título do produto" />
                </F>
              </div>
            </div>
          ) : (
            <F label="Título" required>
              <input value={form.dscTituloProd} onChange={s('dscTituloProd')} className={inp} placeholder="Digite o título do produto" />
            </F>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            {materialType === 'periodico' && (
              <F label="Tipo" required>
                <CustomSelect
                  value={form.dscTipoProd}
                  onChange={(val) => handleTipoChange(val as any)}
                  options={[
                    { value: 'revista', label: 'Revista' },
                    { value: 'jornal', label: 'Jornal' },
                  ]}
                  placeholder="Selecione o tipo..."
                />
              </F>
            )}

            {materialType === 'outros' && (
              <F label="Tipo" required>
                <CustomSelect
                  value={form.dscTipoProd}
                  onChange={(val) => handleTipoChange(val as any)}
                  options={[
                    { value: 'cd', label: 'CD' },
                    { value: 'dvd', label: 'DVD' },
                    { value: 'nuvem', label: 'Nuvem' },
                    { value: 'mapa', label: 'Mapa' },
                    { value: 'audiobook', label: 'Audiobook' },
                    { value: 'software', label: 'Software' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                  placeholder="Selecione o tipo..."
                />
              </F>
            )}

            {materialType === 'outros' && (
              <F label="Formato">
                <CustomSelect
                  value={form.dscFormatoProd}
                  onChange={(val) => setForm(f => ({ ...f, dscFormatoProd: val as '' | 'pdf' | 'video' }))}
                  options={[
                    { value: '', label: 'Nenhum' },
                    { value: 'pdf', label: 'PDF' },
                    { value: 'video', label: 'Vídeo' },
                  ]}
                  placeholder="Selecione o formato..."
                  disabled={!isNuvem}
                  disabledPlaceholder="Apenas tipo Nuvem"
                />
              </F>
            )}
          </div>
        </Section>

        <Section icon={Tag} title="Classificação & Acervo">
          <div className="grid grid-cols-2 gap-4">
            <F label={getEditoraLabel(form.dscTipoProd)} required>
              <CustomSelect
                value={form.idEditora}
                onChange={(val) => setForm(f => ({ ...f, idEditora: val }))}
                options={editoras.map(ed => ({ value: ed._id!, label: ed.dscEditora }))}
                placeholder={`Selecione ou digite...`}
                searchable
                creatable
                onCreate={async (val) => {
                  try {
                    const res = await createEditora({ dscEditora: val })
                    if (res.data?._id) {
                      setEditoras(prev => [...prev, res.data])
                      return res.data._id
                    }
                  } catch (e) {
                    console.error('Failed to create editora', e)
                  }
                  return undefined
                }}
              />
            </F>
            <F label="Autor Principal">
              <CustomSelect
                value={form.idAutor}
                onChange={(val) => setForm(f => ({ ...f, idAutor: val }))}
                options={autores.map(a => ({ value: a._id!, label: a.nome }))}
                placeholder="Selecione ou digite..."
                searchable
                creatable
                onCreate={async (val) => {
                  try {
                    const res = await createAutor({ nome: val })
                    if (res.data?._id) {
                      setAutores(prev => [...prev, res.data])
                      return res.data._id
                    }
                  } catch (e) {
                    console.error('Failed to create autor', e)
                  }
                  return undefined
                }}
              />
            </F>
          </div>

          {/* Conditional fields grid */}
          <div className="grid grid-cols-2 gap-4">
            <F label={isCDorDVD ? 'Data de Lançamento' : 'Data de Publicação'}>
              <input
                type="text"
                value={form.numAnoPublProd}
                onChange={sDate('numAnoPublProd')}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={inp}
              />
            </F>

            <F label={getCategoriaLabel(form.dscTipoProd)}>
              <MultiSelect
                value={form.dscCategoriaProd}
                onChange={(val) => setForm(f => ({ ...f, dscCategoriaProd: val }))}
                options={getCategoriasList(form.dscTipoProd).map(cat => ({ value: cat, label: cat }))}
                placeholder={`Selecione ou digite o(a) ${getCategoriaLabel(form.dscTipoProd).toLowerCase()}...`}
                allowCustom
              />
            </F>
          </div>

          {(materialType === 'livro' || materialType === 'periodico') && (
            <F label={materialType === 'periodico' ? 'ISSN' : 'ISBN'} required>
              <input
                value={form.numISBNProd}
                onChange={s('numISBNProd')}
                className={inp}
                placeholder={materialType === 'periodico' ? 'Digite o ISSN (ex: 2044-009X)' : 'Digite o ISBN (ex: 9788532511010)'}
              />
            </F>
          )}
        </Section>

        <Section icon={DollarSign} title="Valores & Financeiro">
          <div className="grid grid-cols-2 gap-4">
            <F label="Preço de Venda (R$)" required>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valPrecoProd}
                onChange={s('valPrecoProd')}
                className={inp}
              />
            </F>
            <F label="Multa Diária (R$) - Automático">
              <input type="number" disabled value={form.valMultaDiarProd} className={inp + ' bg-gray-50 cursor-not-allowed opacity-75'} />
            </F>
          </div>
        </Section>

        {!initial && (
          form.dscTipoProd === 'nuvem' || form.dscTipoProd === 'audiobook' ? (
            <Section icon={Copy} title="Exemplares">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 text-xs text-sky-700">
                Este é um produto digital (acesso em nuvem). Produtos digitais não necessitam de exemplares físicos no acervo e possuem disponibilidade ilimitada para os associados.
              </div>
            </Section>
          ) : (
            <Section icon={Copy} title="Exemplares">
              <F label="Quantidade de Exemplares Inicial">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.qtdExemplares}
                  onChange={s('qtdExemplares')}
                  className={inp}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Quantos exemplares físicos você deseja criar automaticamente para este produto?
                </p>
              </F>
            </Section>
          )
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100">
        <button type="button" onClick={onCancel} className={`w-full ${btnSec}`}>Cancelar</button>
        <button type="submit" disabled={saving} className={`w-full ${btnPri}`}>{saving ? 'Salvando…' : (initial ? 'Salvar Alterações' : 'Salvar Produto')}</button>
      </div>
    </form>
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

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-black ml-1">*</span>}</label>{children}</div>
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 font-medium${right ? ' text-right' : ''}`}>{children}</th>
}
function Skeleton() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div> }

const btn    = 'flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm'
const inp    = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400'
const btnPri = 'px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm'
const btnSec = 'px-4 py-2 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-55 transition-colors'
