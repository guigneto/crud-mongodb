import CustomSelect from '../components/CustomSelect'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import { getExemplares, purchaseExemplar, type Exemplar } from '../services/exemplares.service'
import { getProdutos, type Produto } from '../services/produtos.service'
import { getEmprestimos, type Emprestimo } from '../services/emprestimos.service'
import { getAssociados, type Associado } from '../services/associados.service'
import { type FormaPagto } from '../services/pagamentos.service'
import { formatDateBR } from '../utils/date'

export default function Compras() {
  const [exemplares, setExemplares] = useState<Exemplar[]>([])
  const [produtos, setProdutos] = useState<Record<string, Produto>>({})
  const [associados, setAssociados] = useState<Associado[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Exemplar | null>(null)
  const [selectedAssoc, setSelectedAssoc] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<FormaPagto>('pix')
  const [discountValue, setDiscountValue] = useState('0')
  const [actionError, setActionError] = useState('')
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rEx, rProd, rEmp, rAssoc] = await Promise.all([
        getExemplares(),
        getProdutos(),
        getEmprestimos(),
        getAssociados(),
      ])
      setExemplares(rEx.data)
      const prodMap: Record<string, Produto> = {}
      rProd.data.forEach((p) => { prodMap[p._id!] = p })
      setProdutos(prodMap)
      setEmprestimos(rEmp.data)
      setAssociados(rAssoc.data)
    } catch {
      setExemplares([])
      setProdutos({})
      setEmprestimos([])
      setAssociados([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const availableExemplares = useMemo(() => exemplares.filter(ex => ex.dscStatusExemplar !== 'Vendido'), [exemplares])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return availableExemplares
    return availableExemplares.filter(ex => {
      const prod = produtos[ex.idProd]
      const title = prod?.dscTituloProd?.toLowerCase() || ''
      const prodCode = prod?.codProd?.toLowerCase() || ''
      const state = (ex.estado || '').toLowerCase()
      const status = (ex.dscStatusExemplar || '').toLowerCase()
      return title.includes(q) || prodCode.includes(q) || state.includes(q) || status.includes(q) || ex.codExemplar?.toLowerCase().includes(q)
    })
  }, [availableExemplares, produtos, query])

  const displayed = filtered.sort((a, b) => (a.codExemplar || '').localeCompare(b.codExemplar || ''))

  const productGroups = useMemo(() => {
    const groups: Record<string, { produto: Produto | null; exemplares: Exemplar[] }> = {}
    displayed.forEach((ex) => {
      const prod = produtos[ex.idProd] || null
      const key = ex.idProd || ex._id || 'unknown'
      if (!groups[key]) groups[key] = { produto: prod, exemplares: [] }
      groups[key].exemplares.push(ex)
    })

    return Object.values(groups)
      .map((group) => ({
        produto: group.produto,
        exemplares: group.exemplares.sort((a, b) => (a.codExemplar || '').localeCompare(b.codExemplar || ''))
      }))
      .sort((a, b) => {
        const titleA = a.produto?.dscTituloProd || ''
        const titleB = b.produto?.dscTituloProd || ''
        if (titleA !== titleB) return titleA.localeCompare(titleB)
        return (a.produto?.codProd || '').localeCompare(b.produto?.codProd || '')
      })
  }, [displayed, produtos])

  async function handlePurchase(exemplar: Exemplar) {
    setSelected(exemplar)
    setSelectedAssoc('')
    setPaymentMethod('pix')
    setDiscountValue('0')
    setActionError('')
    setPurchaseOpen(true)
  }

  async function confirmPurchase() {
    if (!selected || !selected._id) return
    if (!selectedAssoc) {
      setActionError('Selecione um associado para registrar o pagamento da compra.')
      return
    }

    setSaving(true)
    try {
      await purchaseExemplar(selected._id, {
        idAssoc: selectedAssoc,
        dscFormPagto: paymentMethod,
        valDescPagto: Number(discountValue) || 0,
      })
      setPurchaseOpen(false)
      load()
    } catch (err: any) {
      setActionError(err?.response?.data?.error || 'Erro ao efetuar compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras de Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Selecione um exemplar para marcar como vendido.</p>
        </div>
      </div>

      <div className="mb-6 w-full">
        <SearchBar placeholder="Buscar por título, código ou exemplar..." onSearch={setQuery} />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      ) : !displayed.length ? (
        <p className="text-center text-gray-400 py-16">Nenhum exemplar disponível para compra.</p>
      ) : (
        <div className="space-y-6">
          {productGroups.map((group) => {
            const prod = group.produto
            const productKey = prod?._id || group.exemplares[0]._id || 'group'
            const price = prod?.valVendaProd ?? 0
            return (
              <div key={productKey} className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-gray-50 rounded-t-3xl border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Produto</div>
                    <div className="font-semibold text-gray-900">{prod?.dscTituloProd || 'Produto desconhecido'}</div>
                    <div className="text-xs text-gray-400 mt-1">Cód: {prod?.codProd || 'N/A'}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{group.exemplares.length} exemplar(es)</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Preço unitário: R$ {price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white text-gray-600 text-left">
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider">Exemplar</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider">Criado em</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.exemplares.map((ex) => {
                        const soldLoan = emprestimos.find(em => em.idExemplar === ex._id && em.status !== 'cancelado' && !em.datEfetEntrEmpr)
                        return (
                          <tr key={ex._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{ex.codExemplar || ex._id}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDateBR((ex as { createdAt?: string }).createdAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handlePurchase(ex)}
                                disabled={!!soldLoan}
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                              >
                                <CreditCard size={14} /> Comprar
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        title="Confirmar Compra"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">Deseja marcar este exemplar como vendido? Ele ficará indisponível para empréstimos.</p>
          {selected && (
            <>
              {/* Detalhes do Exemplar */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Exemplar</div>
                  <div className="font-medium text-gray-900">{selected.codExemplar || selected._id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Produto</div>
                  <div className="font-medium text-gray-900">{produtos[selected.idProd]?.dscTituloProd || 'Desconhecido'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Preço</div>
                  <div className="font-medium text-gray-900">R$ {(produtos[selected.idProd]?.valVendaProd ?? 0).toFixed(2)}</div>
                </div>
              </div>

              {/* Associado */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Associado responsável</label>
                <CustomSelect
                  value={selectedAssoc}
                  onChange={(value) => setSelectedAssoc(value)}
                  options={associados.map((assoc) => ({
                    value: assoc._id || '',
                    label: `${assoc.nomAssoc} (${assoc.codAssoc || assoc._id})`
                  }))}
                  placeholder="Selecione um associado"
                  searchable
                  className="w-full"
                />
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Forma de pagamento</label>
                <CustomSelect
                  value={paymentMethod}
                  onChange={(value) => {
                    const method = value as FormaPagto
                    setPaymentMethod(method)
                    if (method === 'dinheiro') {
                      const discount = ((produtos[selected?.idProd ?? '']?.valVendaProd ?? 0) * 0.1)
                      setDiscountValue(discount.toFixed(2))
                    } else {
                      setDiscountValue('0')
                    }
                  }}
                  options={[
                    { value: 'pix', label: 'PIX' },
                    { value: 'dinheiro', label: 'Dinheiro' },
                    { value: 'cartao_credito', label: 'Cartão de crédito' },
                    { value: 'cartao_debito', label: 'Cartão de débito' },
                    { value: 'picpay', label: 'PicPay' },
                  ]}
                  placeholder="Selecione a forma de pagamento"
                  className="w-full"
                />
              </div>

              {/* Desconto - Apenas para Dinheiro */}
              {paymentMethod === 'dinheiro' && (
                <div className="space-y-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700">Desconto (10% automático)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">R$</span>
                    <input
                      type="number"
                      readOnly
                      value={Number(discountValue).toFixed(2)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-amber-700">O desconto de 10% é aplicado automaticamente ao pagar em dinheiro.</p>
                </div>
              )}
            </>
          )}
          {actionError && <p className="text-sm text-red-500">{actionError}</p>}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setPurchaseOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={confirmPurchase} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{saving ? 'Processando…' : 'Confirmar Compra'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
