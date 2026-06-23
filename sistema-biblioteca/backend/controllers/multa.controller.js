import Multa from '../models/multa.model.js';
import Pagamento from '../models/pagamento.model.js';
import Emprestimo from '../models/emprestimo.model.js';
import Exemplar from '../models/exemplar.model.js';
import Produto from '../models/produto.model.js';

const MS_POR_DIA = 1000 * 60 * 60 * 24;

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

// Calcula o valor da multa por atraso com base nas datas do empréstimo
// e no valor da multa diária do produto vinculado ao exemplar.
async function calcularMultaAtraso(idEmpr) {
  const emprestimo = await Emprestimo.findById(idEmpr);
  if (!emprestimo) return null;

  const exemplar = await Exemplar.findById(emprestimo.idExemplar);
  const produto = exemplar ? await Produto.findById(exemplar.idProd) : null;
  const valorDiaria = produto?.valMultaDiarProd ?? 0;

  const dataPrevista = new Date(emprestimo.datPrevEntrEmpr);
  // Se ainda não foi devolvido, usa a data atual como referência.
  const dataEntrega = emprestimo.datEfetEntrEmpr ? new Date(emprestimo.datEfetEntrEmpr) : new Date();

  const diasAtraso = Math.max(0, Math.ceil((dataEntrega - dataPrevista) / MS_POR_DIA));

  return { diasAtraso, valorDiaria, valMult: diasAtraso * valorDiaria };
}

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
    const dados = { ...req.body };
    if (!dados.dscStatusMult) dados.dscStatusMult = 'PENDENTE';

    if (dados.dscTipMult === 'atraso') {
      const calc = await calcularMultaAtraso(dados.idEmpr);
      if (!calc) return res.status(400).json({ error: 'Empréstimo não encontrado para cálculo da multa.' });
      dados.valMult = calc.valMult;
    }

    const multa = await Multa.create(dados);
    res.status(201).json(multa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMulta = async (req, res) => {
  try {
    const dados = { ...req.body };

    if (dados.dscTipMult === 'atraso') {
      const idEmpr = dados.idEmpr ?? (await Multa.findById(req.params.id))?.idEmpr;
      const calc = await calcularMultaAtraso(idEmpr);
      if (!calc) return res.status(400).json({ error: 'Empréstimo não encontrado para cálculo da multa.' });
      dados.valMult = calc.valMult;
    }

    const multa = await Multa.findByIdAndUpdate(req.params.id, dados, {
      new: true,
      runValidators: true,
    });
    if (!multa) return res.status(404).json({ error: 'Multa não encontrada' });

    await atualizarStatusMulta(multa._id);
    const updatedMulta = await Multa.findById(multa._id);
    res.json(updatedMulta);
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
