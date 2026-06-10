import { NavLink } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Users, BookMarked,
  ClipboardList, AlertCircle,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/associados', icon: Users,    label: 'Associados', end: false },
  { to: '/produtos',   icon: BookMarked, label: 'Produtos',   end: false },
  { to: '/emprestimos', icon: ClipboardList, label: 'Empréstimos', end: false },
  { to: '/multas',      icon: AlertCircle,   label: 'Multas',      end: false },
]

export default function Navbar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <>
      <button
        onClick={onToggle}
        className={`fixed z-50 top-6 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:shadow-md cursor-pointer transition-all duration-300 ${
          collapsed ? 'left-[68px]' : 'left-[248px]'
        }`}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        {/* Header */}
        <div className={`h-[70px] flex items-center border-b border-gray-200 shrink-0 transition-all duration-300 ${collapsed ? 'px-0 justify-center' : 'px-6 gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-white shrink-0" />
          </div>
          <div className={`flex flex-col justify-center overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="font-bold text-xl text-gray-900 whitespace-nowrap tracking-tight">Acervo.io</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 flex flex-col gap-2 transition-all duration-300 ${collapsed ? 'px-3' : 'px-4'}`}>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-lg transition-all duration-200 ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-gray-200 shrink-0 py-5 transition-all duration-300 ${collapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
              AS
            </div>
            <div className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">Ana Silva</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">Bibliotecária</span>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Sair do sistema">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
