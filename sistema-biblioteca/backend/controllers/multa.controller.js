import Multa from '../models/multa.model.js';

export const getMultas = async (req, res) => {
  try {
    const multas = await Multa.find();
    res.json(multas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMultaById = async (req, res) => {
  try {
    const multa = await Multa.findById(req.params.id);
    if (!multa) return res.status(404).json({ error: 'Multa não encontrada' });
    res.json(multa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMulta = async (req, res) => {
  try {
    const multa = await Multa.create(req.body);
    res.status(201).json(multa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMulta = async (req, res) => {
  try {
    const multa = await Multa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!multa) return res.status(404).json({ error: 'Multa não encontrada' });
    res.json(multa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMulta = async (req, res) => {
  try {
    const multa = await Multa.findByIdAndDelete(req.params.id);
    if (!multa) return res.status(404).json({ error: 'Multa não encontrada' });
    res.json({ message: 'Multa removida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
