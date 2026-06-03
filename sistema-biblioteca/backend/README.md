# Backend — Sistema de Biblioteca

API em Node + Express + Mongoose.

## Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente (ou string de conexão de um Atlas)

## Setup

1. Instale as dependências:

   ```bash
   npm i
   ```

2. Crie um arquivo `.env` na raiz do `backend/` com:

   ```
   PORT=3000
   ```

3. Rode em modo dev (com nodemon):

   ```bash
   npm run dev
   ```

   Ou em modo normal:

   ```bash
   npm start
   ```

O servidor sobe em `http://localhost:3000`.

## Estrutura

```
backend/
├── app.js          # entrypoint do Express
├── config/         # configuração de env
├── routes/         # rotas da API
└── .env            # variáveis de ambiente (não commitar)
```
