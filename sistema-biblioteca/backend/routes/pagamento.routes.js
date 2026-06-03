import { Router } from 'express';
import { getPagamentos, getPagamentoById, createPagamento, updatePagamento, deletePagamento } from '../controllers/pagamento.controller.js';

const pagamentoRouter = Router();

pagamentoRouter.get('/', getPagamentos);
pagamentoRouter.get('/:id', getPagamentoById);
pagamentoRouter.post('/', createPagamento);
pagamentoRouter.put('/:id', updatePagamento);
pagamentoRouter.delete('/:id', deletePagamento);

export default pagamentoRouter;
