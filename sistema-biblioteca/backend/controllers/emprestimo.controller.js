import Emprestimo from '../models/emprestimo.model.js';

export const getEmprestimos = async (req, res) => {
  try {
    const emprestimos = await Emprestimo.find();
    res.json(emprestimos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmprestimoById = async (req, res) => {
  try {
    const emprestimo = await Emprestimo.findById(req.params.id);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    res.json(emprestimo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const MAX_EMPRESTIMOS_ATIVOS = 3;

export const createEmprestimo = async (req, res) => {
  try {
    const { idAssoc } = req.body;

    if (idAssoc) {
      const ativos = await Emprestimo.countDocuments({
        idAssoc,
        datEfetEntrEmpr: null,
      });

      if (ativos >= MAX_EMPRESTIMOS_ATIVOS) {
        return res.status(400).json({
          error: `Este associado já possui o máximo de ${MAX_EMPRESTIMOS_ATIVOS} empréstimos ativos. Não é possível criar um novo empréstimo.`,
        });
      }
    }

    const emprestimo = await Emprestimo.create(req.body);
    res.status(201).json(emprestimo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateEmprestimo = async (req, res) => {
  try {
    const emprestimo = await Emprestimo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    res.json(emprestimo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEmprestimo = async (req, res) => {
  try {
    const emprestimo = await Emprestimo.findByIdAndDelete(req.params.id);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    res.json({ message: 'Empréstimo removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
