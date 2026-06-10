# Referência de Componentes — Sistema Biblioteca (Frontend React)

Este arquivo documenta a estrutura do frontend React original para guiar a implementação
futura de páginas e componentes que consomem a API do backend.

---

## Páginas (Routes)

| Página | Rota sugerida | Responsabilidade |
|---|---|---|
| `Home` | `/` | Dashboard: cards de stats (livros, usuários, empréstimos ativos, atrasados) |
| `Usuarios` | `/usuarios` | CRUD de usuários cadastrados na biblioteca |
| `Livros` | `/livros` | CRUD do acervo (busca por título, autor, ISBN) |
| `Gestao` | `/gestao` | Empréstimos: registrar, devolver, listar atrasados |

---

## Componentes a implementar

### Globais

| Componente | Arquivo sugerido | Responsabilidade |
|---|---|---|
| `Navbar` | `components/Navbar.tsx` | Navegação entre seções, logo da biblioteca, botão dark mode |

### Página: Home (Dashboard)

| Componente | Arquivo sugerido | Responsabilidade |
|---|---|---|
| `StatsCard` | `components/StatsCard.tsx` | Card com ícone + número + label (ex: "42 livros") |

### Página: Usuários

| Componente | Arquivo sugerido | Responsabilidade |
|---|---|---|
| `UserTable` | `components/UserTable.tsx` | Tabela paginada com listagem de usuários |
| `UserForm` | `components/UserForm.tsx` | Formulário de cadastro e edição (dentro de um Dialog) |

### Página: Livros

| Componente | Arquivo sugerido | Responsabilidade |
|---|---|---|
| `BookTable` | `components/BookTable.tsx` | Listagem do acervo (tabela ou cards) |
| `BookForm` | `components/BookForm.tsx` | Formulário de cadastro/edição de livro |
| `SearchBar` | `components/SearchBar.tsx` | Input de busca com debounce (título, autor, ISBN) |
| `ImageWithFallback` | `components/ImageWithFallback.tsx` | `<img>` com SVG fallback se a URL falhar |

### Página: Gestão de Empréstimos

| Componente | Arquivo sugerido | Responsabilidade |
|---|---|---|
| `LoanTable` | `components/LoanTable.tsx` | Tabela de empréstimos ativos e atrasados |
| `LoanForm` | `components/LoanForm.tsx` | Formulário para registrar novo empréstimo |

---

## UI Components (shadcn/ui)

Instalar via `npx shadcn@latest add <nome>`. Os componentes usados no design original:

```
button card input select dialog alert-dialog badge tabs table
scroll-area form label separator skeleton sonner accordion avatar
breadcrumb calendar carousel checkbox collapsible command context-menu
drawer dropdown-menu hover-card menubar navigation-menu pagination
popover progress radio-group resizable sheet sidebar slider switch
textarea toggle toggle-group tooltip
```

---

## Dependências necessárias

```bash
# Base React + Vite já incluído no template
npm install lucide-react          # ícones
npm install clsx tailwind-merge   # merge de classes Tailwind
npm install class-variance-authority  # variantes de componentes (CVA)
npm install react-router-dom      # roteamento entre páginas

# Instalado automaticamente pelo shadcn init:
# @radix-ui/*, react-hook-form, recharts, sonner, etc.
```

---

## Paleta e tema

- Cor principal: **amber** (tons de âmbar/dourado)
- Suporte a dark mode via variáveis CSS (OKLCH)
- Estilo: Tailwind CSS + shadcn/ui tokens
- Fonte padrão: sans-serif do sistema

---

## Integração com a API do backend

Ao implementar cada página, substituir os dados mock por chamadas à API Express/MongoDB:

| Recurso | Endpoint esperado |
|---|---|
| Usuários | `GET/POST/PUT/DELETE /api/usuarios` |
| Livros | `GET/POST/PUT/DELETE /api/livros` |
| Empréstimos | `GET/POST/PUT/DELETE /api/emprestimos` |
| Dashboard stats | `GET /api/stats` |
