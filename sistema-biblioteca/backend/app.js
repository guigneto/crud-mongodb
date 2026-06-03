import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';

import autorRouter from './routes/autor.routes.js';
import produtoRouter from './routes/produto.routes.js';
import associadoRouter from './routes/associado.routes.js';
import editoraRouter from './routes/editora.routes.js';
import emprestimoRouter from './routes/emprestimo.routes.js';
import exemplarRouter from './routes/exemplar.routes.js';
import multaRouter from './routes/multa.routes.js';
import pagamentoRouter from './routes/pagamento.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

app.use('/autores', autorRouter);
app.use('/produtos', produtoRouter);
app.use('/associados', associadoRouter);
app.use('/editoras', editoraRouter);
app.use('/emprestimos', emprestimoRouter);
app.use('/exemplares', exemplarRouter);
app.use('/multas', multaRouter);
app.use('/pagamentos', pagamentoRouter);

app.get('/', (req, res) => {
  res.send('Bem vindo a API da Biblioteca!');
});

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Servidor rodando na http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;
