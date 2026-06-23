import { Router } from 'express';
import { getExemplares, getExemplarById, createExemplar, updateExemplar, purchaseExemplar, deleteExemplar } from '../controllers/exemplar.controller.js';

const exemplarRouter = Router();

exemplarRouter.get('/', getExemplares);
exemplarRouter.get('/:id', getExemplarById);
exemplarRouter.post('/', createExemplar);
exemplarRouter.put('/:id', updateExemplar);
exemplarRouter.put('/:id/comprar', purchaseExemplar);
exemplarRouter.delete('/:id', deleteExemplar);

export default exemplarRouter;
