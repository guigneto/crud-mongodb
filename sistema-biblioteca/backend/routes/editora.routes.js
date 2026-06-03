import { Router } from 'express';
import { getEditoras, getEditoraById, createEditora, updateEditora, deleteEditora } from '../controllers/editora.controller.js';

const editoraRouter = Router();

editoraRouter.get('/', getEditoras);
editoraRouter.get('/:id', getEditoraById);
editoraRouter.post('/', createEditora);
editoraRouter.put('/:id', updateEditora);
editoraRouter.delete('/:id', deleteEditora);

export default editoraRouter;
