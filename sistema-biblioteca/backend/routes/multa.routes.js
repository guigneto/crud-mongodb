import { Router } from 'express';
import { getMultas, getMultaById, createMulta, updateMulta, deleteMulta } from '../controllers/multa.controller.js';

const multaRouter = Router();

multaRouter.get('/', getMultas);
multaRouter.get('/:id', getMultaById);
multaRouter.post('/', createMulta);
multaRouter.put('/:id', updateMulta);
multaRouter.delete('/:id', deleteMulta);

export default multaRouter;
