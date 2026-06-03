import { Router } from 'express';
import { getExemplares, getExemplarById, createExemplar, updateExemplar, deleteExemplar } from '../controllers/exemplar.controller.js';

const exemplarRouter = Router();

exemplarRouter.get('/', getExemplares);
exemplarRouter.get('/:id', getExemplarById);
exemplarRouter.post('/', createExemplar);
exemplarRouter.put('/:id', updateExemplar);
exemplarRouter.delete('/:id', deleteExemplar);

export default exemplarRouter;
