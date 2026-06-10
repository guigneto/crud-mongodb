import Associado from '../models/associado.model.js';

export const getAssociados = async (req, res) => {
  try {
    const associados = await Associado.find();
    res.json(associados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssociadoById = async (req, res) => {
  try {
    const associado = await Associado.findById(req.params.id);
    if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });
    res.json(associado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAssociado = async (req, res) => {
  try {
    const ultimoAssoc = await Associado.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (ultimoAssoc && ultimoAssoc.codAssoc) {
      const match = ultimoAssoc.codAssoc.match(/AS-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    req.body.codAssoc = `AS-${String(nextNum).padStart(4, '0')}`;
    const associado = await Associado.create(req.body);
    res.status(201).json(associado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAssociado = async (req, res) => {
  try {
    const associado = await Associado.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });
    res.json(associado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAssociado = async (req, res) => {
  try {
    const associado = await Associado.findByIdAndDelete(req.params.id);
    if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });
    res.json({ message: 'Associado removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
