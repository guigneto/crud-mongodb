import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home        from './pages/Home'
import Associados  from './pages/Associados'
import Produtos    from './pages/Produtos'
import Autores     from './pages/Autores'
import Editoras    from './pages/Editoras'
import Exemplares  from './pages/Exemplares'
import Emprestimos from './pages/Emprestimos'
import Multas      from './pages/Multas'
import Pagamentos  from './pages/Pagamentos'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 ml-64 p-8 overflow-auto min-h-screen">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/associados"  element={<Associados />} />
            <Route path="/produtos"    element={<Produtos />} />
            <Route path="/autores"     element={<Autores />} />
            <Route path="/editoras"    element={<Editoras />} />
            <Route path="/exemplares"  element={<Exemplares />} />
            <Route path="/emprestimos" element={<Emprestimos />} />
            <Route path="/multas"      element={<Multas />} />
            <Route path="/pagamentos"  element={<Pagamentos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
