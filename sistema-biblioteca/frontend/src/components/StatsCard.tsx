import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: number | string
  icon: LucideIcon
  color: 'warm' | 'blue' | 'green' | 'red'
  loading?: boolean
}

const colorMap = {
  warm: { bg: 'bg-warm-50 border-warm-100',   icon: 'bg-warm-100 text-warm-700', value: 'text-warm-700' },
  blue:  { bg: 'bg-blue-50 border-blue-100',     icon: 'bg-blue-100 text-blue-600',   value: 'text-blue-700'  },
  green: { bg: 'bg-green-50 border-green-100',   icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  red:   { bg: 'bg-red-50 border-red-100',       icon: 'bg-red-100 text-red-600',     value: 'text-red-700'   },
}

export default function StatsCard({ title, value, icon: Icon, color, loading }: Props) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl p-6 border shadow-sm ${c.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-3 rounded-lg ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      {loading ? (
        <div className="h-9 bg-gray-200 rounded animate-pulse w-16" />
      ) : (
        <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
      )}
    </div>
  )
}
