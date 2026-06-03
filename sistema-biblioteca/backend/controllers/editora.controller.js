import Editora from '../models/editora.model.js';

export const getEditoras = async (req, res) => {
  try {
    const editoras = await Editora.find();
    res.json(editoras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEditoraById = async (req, res) => {
  try {
    const editora = await Editora.findById(req.params.id);
    if (!editora) return res.status(404).json({ error: 'Editora não encontrada' });
    res.json(editora);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEditora = async (req, res) => {
  try {
    const editora = await Editora.create(req.body);
    res.status(201).json(editora);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateEditora = async (req, res) => {
  try {
    const editora = await Editora.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!editora) return res.status(404).json({ error: 'Editora não encontrada' });
    res.json(editora);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEditora = async (req, res) => {
  try {
    const editora = await Editora.findByIdAndDelete(req.params.id);
    if (!editora) return res.status(404).json({ error: 'Editora não encontrada' });
    res.json({ message: 'Editora removida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
