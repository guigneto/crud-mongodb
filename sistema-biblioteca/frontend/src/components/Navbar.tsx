import { NavLink } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Users, BookMarked,
  PenLine, Building2, Copy, ClipboardList, AlertCircle, CreditCard,
} from 'lucide-react'

const groups = [
  {
    label: null,
    links: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true }],
  },
  {
    label: 'Pessoas',
    links: [
      { to: '/associados', icon: Users,    label: 'Associados', end: false },
      { to: '/autores',    icon: PenLine,  label: 'Autores',    end: false },
      { to: '/editoras',   icon: Building2,label: 'Editoras',   end: false },
    ],
  },
  {
    label: 'Acervo',
    links: [
      { to: '/produtos',   icon: BookMarked, label: 'Produtos',   end: false },
      { to: '/exemplares', icon: Copy,       label: 'Exemplares', end: false },
    ],
  },
  {
    label: 'Circulação',
    links: [
      { to: '/emprestimos', icon: ClipboardList, label: 'Empréstimos', end: false },
      { to: '/multas',      icon: AlertCircle,   label: 'Multas',      end: false },
      { to: '/pagamentos',  icon: CreditCard,    label: 'Pagamentos',  end: false },
    ],
  },
]

export default function Navbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 shrink-0">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <BookOpen size={24} className="text-blue-600 shrink-0" />
        </div>
        <div>
          <p className="font-bold text-base text-gray-800 leading-tight tracking-tight">Biblioteca</p>
          <p className="text-xs text-gray-500 font-medium">Sistema de Gestão</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-6">
        {groups.map((g) => (
          <div key={g.label ?? 'main'}>
            {g.label && (
              <p className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {g.label}
              </p>
            )}
            <div className="space-y-1">
              {g.links.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? "text-gray-900" : "text-gray-500"} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-200 text-xs font-medium text-gray-400 shrink-0 text-center">
        v1.0.0
      </div>
    </aside>
  )
}
