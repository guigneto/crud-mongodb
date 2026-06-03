import { Router } from 'express';
import { getEmprestimos, getEmprestimoById, createEmprestimo, updateEmprestimo, deleteEmprestimo } from '../controllers/emprestimo.controller.js';

const emprestimoRouter = Router();

emprestimoRouter.get('/', getEmprestimos);
emprestimoRouter.get('/:id', getEmprestimoById);
emprestimoRouter.post('/', createEmprestimo);
emprestimoRouter.put('/:id', updateEmprestimo);
emprestimoRouter.delete('/:id', deleteEmprestimo);

export default emprestimoRouter;
