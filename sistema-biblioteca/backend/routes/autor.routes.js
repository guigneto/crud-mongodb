import { Router } from 'express';
import { getAutores, getAutor, createAutor, updateAutor, deleteAutor } from '../controllers/autor.controller.js';

const autorRouter = Router();

autorRouter.get('/', getAutores);
autorRouter.get('/:id', getAutor);
autorRouter.post('/', createAutor);
autorRouter.put('/:id', updateAutor);
autorRouter.delete('/:id', deleteAutor);

export default autorRouter;