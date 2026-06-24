import Pagamento from '../models/pagamento.model.js';
import Multa from '../models/multa.model.js';

async function atualizarStatusMulta(idMult) {
  const multa = await Multa.findById(idMult);
  if (!multa) return;
  const pagamentos = await Pagamento.find({ idMult });
  const totalPago = pagamentos.reduce((acc, pg) => acc + pg.valPagto, 0);
  const novoStatus = totalPago >= multa.valMult ? 'PAGO' : 'PENDENTE';
  if (multa.dscStatusMult !== novoStatus) {
    await Multa.findByIdAndUpdate(idMult, { dscStatusMult: novoStatus }, { new: true, runValidators: true });
  }
}

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
    if (pagamento.idMult) {
      await atualizarStatusMulta(pagamento.idMult);
    }
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
    if (pagamento.idMult) {
      await atualizarStatusMulta(pagamento.idMult);
    }
    res.json(pagamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePagamento = async (req, res) => {
  try {
    const pagamento = await Pagamento.findByIdAndDelete(req.params.id);
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });
    if (pagamento.idMult) {
      await atualizarStatusMulta(pagamento.idMult);
    }
    res.json({ message: 'Pagamento removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
