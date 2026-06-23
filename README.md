# Sistema de Biblioteca - CRUD MongoDB

Projeto desenvolvido para a disciplina de **Banco de Dados II** do **IFES - Campus Serra**.

O projeto implementa a modelagem de dados (relacional e não-relacional) de um sistema de biblioteca e uma aplicação **CRUD full-stack** (API REST + interface web) sobre **MongoDB**.

## Componentes do grupo

- Allicia Rocha
- Guilherme Borges
- Guilherme Gomes

## Modelos de interesse

Os modelos de dados solicitados na disciplina estão documentados em arquivos Markdown na raiz do projeto, com diagramas em [Mermaid](https://mermaid.js.org/) (renderizados automaticamente pelo GitHub):

| Modelo | Localização |
|---|---|
| **Modelo Relacional** (Diagrama ER, entidades, cardinalidades e regras de negócio) | [`relacional/modelo-relacional.md`](relacional/modelo-relacional.md) |
| **Esquema Não-Relacional** (modelagem orientada a documentos para MongoDB, embedding vs. referência) | [`nao-relacional/modelo-nao-relacional.md`](nao-relacional/modelo-nao-relacional.md) |

## Estrutura do repositório

```
crud-mongodb/
├── relacional/                 # Modelo Relacional (diagrama ER + descrição)
├── nao-relacional/             # Esquema Não-Relacional (MongoDB)
└── sistema-biblioteca/         # Aplicação CRUD
    ├── backend/                # API REST — Node.js + Express + Mongoose
    └── frontend/               # Interface web — React + Vite + TypeScript
```

## Tecnologias

- **Backend:** Node.js, Express, Mongoose, MongoDB (Atlas)
- **Frontend:** React, Vite, TypeScript, Tailwind CSS

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma instância do **MongoDB** (local ou [MongoDB Atlas](https://www.mongodb.com/atlas)) com a string de conexão em mãos

### 1. Backend (API)

```bash
cd sistema-biblioteca/backend
npm install
```

Crie um arquivo `.env` dentro de `sistema-biblioteca/backend/` com:

```env
PORT=3000
DB_URI='sua-string-de-conexao-do-mongodb'
```

Inicie o servidor:

```bash
npm run dev    # com nodemon (recarrega ao salvar)
# ou
npm start      # produção
```

A API ficará disponível em `http://localhost:3000`.

### 2. Frontend (Interface web)

Em outro terminal:

```bash
cd sistema-biblioteca/frontend
npm install
```

Crie um arquivo `.env` dentro de `sistema-biblioteca/frontend/` com a URL da API:

```env
VITE_API_URL=http://localhost:3000
```

Inicie a aplicação:

```bash
npm run dev
```

A interface ficará disponível na URL indicada pelo Vite (por padrão `http://localhost:5173`).

## Endpoints da API

A API expõe os seguintes recursos (CRUD em cada um):

| Recurso | Rota base |
|---|---|
| Autores | `/autores` |
| Produtos | `/produtos` |
| Associados | `/associados` |
| Editoras | `/editoras` |
| Empréstimos | `/emprestimos` |
| Exemplares | `/exemplares` |
| Multas | `/multas` |
| Pagamentos | `/pagamentos` |
