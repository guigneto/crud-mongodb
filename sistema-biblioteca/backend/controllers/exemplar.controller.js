import Exemplar from '../models/exemplar.model.js';

export const getExemplares = async (req, res) => {
  try {
    const exemplares = await Exemplar.find();
    res.json(exemplares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExemplarById = async (req, res) => {
  try {
    const exemplar = await Exemplar.findById(req.params.id);
    if (!exemplar) return res.status(404).json({ error: 'Exemplar não encontrado' });
    res.json(exemplar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createExemplar = async (req, res) => {
  try {
    const exemplar = await Exemplar.create(req.body);
    res.status(201).json(exemplar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateExemplar = async (req, res) => {
  try {
    const exemplar = await Exemplar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exemplar) return res.status(404).json({ error: 'Exemplar não encontrado' });
    res.json(exemplar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteExemplar = async (req, res) => {
  try {
    const exemplar = await Exemplar.findByIdAndDelete(req.params.id);
    if (!exemplar) return res.status(404).json({ error: 'Exemplar não encontrado' });
    res.json({ message: 'Exemplar removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
