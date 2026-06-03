import { Router } from 'express';
import { getAssociados, getAssociadoById, createAssociado, updateAssociado, deleteAssociado } from '../controllers/associado.controller.js';

const associadoRouter = Router();

associadoRouter.get('/', getAssociados);
associadoRouter.get('/:id', getAssociadoById);
associadoRouter.post('/', createAssociado);
associadoRouter.put('/:id', updateAssociado);
associadoRouter.delete('/:id', deleteAssociado);

export default associadoRouter;
