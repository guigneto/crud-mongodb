import { Search, Bell } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-gray-500">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Buscar em todo o sistema..." 
          className="border-none outline-none text-[15px] w-[300px] text-gray-900 placeholder-gray-400 bg-transparent"
        />
      </div>

      <button className="text-gray-500 p-2 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
        <Bell size={20} />
      </button>
    </header>
  )
}
