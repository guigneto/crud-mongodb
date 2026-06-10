import { useEffect, useState } from 'react'
import {
  Users, BookMarked, ClipboardList, AlertCircle
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { getProdutos }    from '../services/produtos.service'
import { getAssociados }  from '../services/associados.service'
import { getEmprestimos } from '../services/emprestimos.service'
import { getExemplares }  from '../services/exemplares.service'
import { getMultas }      from '../services/multas.service'
import { getPagamentos }  from '../services/pagamentos.service'

export default function Home() {
  const [stats, setStats] = useState({ produtos: 0, associados: 0, emprestimosAtivos: 0, multas: 0, assocComum: 0, assocVip: 0, empDevolvidos: 0 })
  const [chartData, setChartData] = useState({ multasData: [] as any[], aVencer: [] as any[], ultimos: [] as any[] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProdutos(), getAssociados(), getEmprestimos(), getMultas(), getExemplares(), getPagamentos()])
      .then(([p, a, e, m, ex, pg]) => {
        const assocData = a.data
        const emprData = e.data
        const exData = ex.data
        const pData = p.data
        const mData = m.data
        const pgData = pg.data

        setStats({
          produtos:          pData.length,
          associados:        assocData.length,
          assocComum:        assocData.filter((x) => x.dscTipoAssoc === 'comum').length,
          assocVip:          assocData.filter((x) => x.dscTipoAssoc === 'vip').length,
          emprestimosAtivos: emprData.filter((x) => !x.datEfetEntrEmpr).length,
          empDevolvidos:     emprData.filter((x) => x.datEfetEntrEmpr).length,
          multas:            mData.length,
        })

        // Multas: Pendentes vs Recebidas
        let pendentes = 0
        let recebidas = 0
        mData.forEach(multa => {
          const pagtosMulta = pgData.filter(pgt => pgt.idMult.toString() === multa._id?.toString())
          const totalPago = pagtosMulta.reduce((acc, pgt) => acc + pgt.valPagto, 0)
          if (totalPago >= multa.valMult) recebidas++
          else pendentes++
        })
        const multasData = [
          { name: 'Pendentes', value: pendentes, color: '#ef4444' }, // red-500
          { name: 'Recebidas', value: recebidas, color: '#eab308' } // yellow-500
        ]

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        // Empréstimos a Vencer
        const aVencer = emprData
          .filter(empr => !empr.datEfetEntrEmpr) // ativos
          .map(empr => {
            const prev = new Date(empr.datPrevEntrEmpr)
            prev.setHours(0, 0, 0, 0)
            const diffTime = prev.getTime() - hoje.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return { ...empr, diffDays }
          })
          .filter(empr => empr.diffDays <= 3)
          .sort((a, b) => a.diffDays - b.diffDays)
          .slice(0, 5)
          .map(empr => {
            const assoc = assocData.find(as => as._id === empr.idAssoc)
            const exemplar = exData.find(x => x._id === empr.idExemplar)
            const prod = exemplar ? pData.find(pr => pr._id === exemplar.idProd) : null
            
            let st = 'Hoje'
            let stColor = 'bg-blue-100 text-blue-700'
            if (empr.diffDays < 0) {
              st = `${Math.abs(empr.diffDays)}d Atraso`
              stColor = 'bg-red-100 text-red-700'
            } else if (empr.diffDays > 0) {
              st = `Em ${empr.diffDays}d`
              stColor = 'bg-yellow-100 text-yellow-700'
            }

            return {
              id: empr._id,
              associado: assoc ? assoc.nomAssoc : 'Desconhecido',
              produto: prod ? prod.dscTituloProd : 'Desconhecido',
              status: st,
              statusColor: stColor
            }
          })

        // Últimos Empréstimos
        const ultimos = emprData.slice(-5).reverse().map(empr => {
          const assoc = assocData.find(as => as._id === empr.idAssoc)
          const exemplar = exData.find(x => x._id === empr.idExemplar)
          const prod = exemplar ? pData.find(pr => pr._id === exemplar.idProd) : null
          
          let st = 'No Prazo'
          let stColor = 'bg-amber-100 text-amber-700'
          if (empr.datEfetEntrEmpr) {
            st = 'Devolvido'
            stColor = 'bg-gray-100 text-gray-700'
          } else {
            const prev = new Date(empr.datPrevEntrEmpr)
            prev.setHours(0, 0, 0, 0)
            if (hoje > prev) {
              st = 'Atrasado'
              stColor = 'bg-red-100 text-red-700'
            }
          }

          return {
            id: empr._id,
            associado: assoc ? assoc.nomAssoc : 'Desconhecido',
            produto: prod ? prod.dscTituloProd : 'Desconhecido',
            dataRet: new Date(empr.datRetEmpr).toLocaleDateString('pt-BR'),
            status: st,
            statusColor: stColor
          }
        })

        setChartData({ multasData, aVencer, ultimos })
      })
      .catch(() => setError('Não foi possível carregar os dados. Verifique se o backend está rodando.'))
      .finally(() => setLoading(false))
  }, [])

  const ocupacao = stats.produtos > 0
    ? Math.round((stats.emprestimosAtivos / stats.produtos) * 100)
    : 0



  return (
    <div>
      {/* Welcome Banner */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão Geral do Sistema</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}


      {/* Section: Visão Geral (Sem container) */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatMiniCard icon={Users} label="Associados Cadastrados" value={stats.associados} detail={`${stats.assocComum} comuns, ${stats.assocVip} VIPs`} color="blue" loading={loading} />
          <StatMiniCard icon={BookMarked} label="Produtos no Acervo" value={stats.produtos} detail="Total de títulos únicos" color="amber" loading={loading} />
          <StatMiniCard icon={ClipboardList} label="Empréstimos Ativos" value={stats.emprestimosAtivos} detail={`${stats.empDevolvidos} devolvidos`} color="yellow" loading={loading} />
          <StatMiniCard icon={AlertCircle} label="Taxa de Ocupação" value={`${ocupacao}%`} detail="Do acervo em circulação" color="red" loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Lista de Alertas: Empréstimos a Vencer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col xl:col-span-1 h-[350px]">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Alertas a Vencer</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : chartData.aVencer.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="flex flex-col gap-3">
                {chartData.aVencer.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="text-sm font-medium text-gray-900 truncate">{item.produto}</span>
                      <span className="text-xs text-gray-500 truncate">{item.associado}</span>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md whitespace-nowrap ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Nenhum alerta crítico</div>
          )}
        </div>

        {/* Gráfico de Multas: Pendentes vs Recebidas */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col xl:col-span-1 h-[350px]">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Multas (Qtd)</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : (chartData.multasData.reduce((a,b) => a + b.value, 0)) > 0 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.multasData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.multasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Nenhuma multa registrada</div>
          )}
        </div>

        {/* Tabela de Últimos Empréstimos */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col xl:col-span-1 h-[350px]">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimas Movimentações</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : chartData.ultimos.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="flex flex-col gap-3">
                {chartData.ultimos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="text-sm font-medium text-gray-900 truncate">{item.produto}</span>
                      <span className="text-xs text-gray-500 truncate">{item.associado} • {item.dataRet}</span>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md whitespace-nowrap ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Nenhum empréstimo registrado</div>
          )}
        </div>

      </div>


    </div>
  )
}

/* ── Stat Mini Card ────────────────────────────────────────────────────── */
const colorMap: Record<string, { bgIcon: string; textIcon: string; textDetail: string }> = {
  blue:   { bgIcon: 'bg-blue-100',   textIcon: 'text-blue-600',   textDetail: 'text-gray-500' },
  amber:  { bgIcon: 'bg-amber-100',  textIcon: 'text-amber-600',  textDetail: 'text-gray-500' },
  yellow: { bgIcon: 'bg-yellow-100', textIcon: 'text-yellow-600', textDetail: 'text-yellow-600' },
  red:    { bgIcon: 'bg-red-100',    textIcon: 'text-red-600',    textDetail: 'text-red-600' },
}

function StatMiniCard({ icon: Icon, label, value, detail, color, loading, minimal = false }: {
  icon?: any; label: string; value: string | number; detail?: string; color: string; loading: boolean; minimal?: boolean
}) {
  const c = colorMap[color] || colorMap.blue

  if (minimal) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${c.bgIcon}/50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}>
        {loading ? (
          <div className="flex flex-col items-center w-full">
            <div className="h-4 w-20 bg-black/5 rounded animate-pulse mb-2" />
            <div className="h-7 w-10 bg-black/5 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className={`text-xs font-medium mb-1.5 ${c.textIcon}`}>{label}</p>
            <p className={`text-2xl font-bold text-gray-900`}>{value}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[14px] font-semibold text-gray-500 leading-tight w-2/3">{label}</h3>
        <div className={`w-10 h-10 rounded-xl ${c.bgIcon} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={c.textIcon} />
        </div>
      </div>
      <div className="mt-auto">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
        {detail && <p className={`text-[12px] font-medium mt-1 ${c.textDetail}`}>{detail}</p>}
      </div>
    </div>
  )
}
