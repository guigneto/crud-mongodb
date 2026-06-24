import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home        from './pages/Home'
import Associados  from './pages/Associados'
import Produtos    from './pages/Produtos'
import Compras     from './pages/Compras'
import Emprestimos from './pages/Emprestimos'
import Multas      from './pages/Multas'
import Exemplares  from './pages/Exemplares'
import TopBar      from './components/TopBar'
import { ConfirmProvider } from './contexts/ConfirmContext'

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <ConfirmProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Navbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-[80px]' : 'ml-[260px]'}`}>
            <TopBar />
            <main className="flex-1 p-8 overflow-auto">
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/associados"  element={<Associados />} />
                <Route path="/produtos"    element={<Produtos />} />
                <Route path="/compras"     element={<Compras />} />
                <Route path="/emprestimos" element={<Emprestimos />} />
                <Route path="/multas"      element={<Multas />} />
                <Route path="/exemplares"  element={<Exemplares />} />
              </Routes>
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </BrowserRouter>
  )
}
