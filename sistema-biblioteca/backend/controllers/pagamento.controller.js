import Pagamento from '../models/pagamento.model.js';

export const getPagamentos = async (req, res) => {
  try {
    const pagamentos = await Pagamento.find();
    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPagamentoById = async (req, res) => {
  try {
    const pagamento = await Pagamento.findById(req.params.id);
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(pagamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPagamento = async (req, res) => {
  try {
    const pagamento = await Pagamento.create(req.body);
    res.status(201).json(pagamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePagamento = async (req, res) => {
  try {
    const pagamento = await Pagamento.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(pagamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePagamento = async (req, res) => {
  try {
    const pagamento = await Pagamento.findByIdAndDelete(req.params.id);
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json({ message: 'Pagamento removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
