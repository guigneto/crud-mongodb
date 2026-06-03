import { useEffect, useState } from 'react'
import { Users, BookMarked, ClipboardList, AlertCircle } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import { getProdutos }    from '../services/produtos.service'
import { getAssociados }  from '../services/associados.service'
import { getEmprestimos } from '../services/emprestimos.service'
import { getMultas }      from '../services/multas.service'

export default function Home() {
  const [stats, setStats] = useState({ produtos: 0, associados: 0, emprestimosAtivos: 0, multas: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProdutos(), getAssociados(), getEmprestimos(), getMultas()])
      .then(([p, a, e, m]) => setStats({
        produtos:          p.data.length,
        associados:        a.data.length,
        emprestimosAtivos: e.data.filter((x) => !x.datEfetEntrEmpr).length,
        multas:            m.data.length,
      }))
      .catch(() => setError('Não foi possível carregar os dados. Verifique se o backend está rodando.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema de biblioteca</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard title="Produtos no Acervo"   value={stats.produtos}          icon={BookMarked}    color="warm" loading={loading} />
        <StatsCard title="Associados"           value={stats.associados}        icon={Users}         color="blue"  loading={loading} />
        <StatsCard title="Empréstimos Ativos"   value={stats.emprestimosAtivos} icon={ClipboardList} color="green" loading={loading} />
        <StatsCard title="Multas Registradas"   value={stats.multas}            icon={AlertCircle}   color="red"   loading={loading} />
      </div>
    </div>
  )
}
