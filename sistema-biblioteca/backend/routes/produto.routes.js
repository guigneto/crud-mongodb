import { Router } from 'express';
import { getProdutos, getProduto, createProduto, updateProduto, deleteProduto } from '../controllers/produto.controller.js';

const produtoRouter = Router();

produtoRouter.get('/', getProdutos);
produtoRouter.get('/:id', getProduto);
produtoRouter.post('/', createProduto);
produtoRouter.put('/:id', updateProduto);
produtoRouter.delete('/:id', deleteProduto);

export default produtoRouter;
