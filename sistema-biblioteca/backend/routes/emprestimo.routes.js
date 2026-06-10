import { Router } from 'express';
import { getEmprestimos, getEmprestimoById, createEmprestimo, updateEmprestimo, deleteEmprestimo, getEmprestimosAtivosByAssociado, renovarEmprestimo, cancelarEmprestimo } from '../controllers/emprestimo.controller.js';

const emprestimoRouter = Router();

emprestimoRouter.get('/', getEmprestimos);
emprestimoRouter.get('/ativos/:idAssoc', getEmprestimosAtivosByAssociado);
emprestimoRouter.get('/:id', getEmprestimoById);
emprestimoRouter.post('/', createEmprestimo);
emprestimoRouter.put('/:id', updateEmprestimo);
emprestimoRouter.delete('/:id', deleteEmprestimo);
emprestimoRouter.post('/:id/renovar', renovarEmprestimo);
emprestimoRouter.post('/:id/cancelar', cancelarEmprestimo);

export default emprestimoRouter;
