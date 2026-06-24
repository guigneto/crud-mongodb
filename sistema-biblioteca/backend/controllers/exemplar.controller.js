import Exemplar from '../models/exemplar.model.js';
import Produto from '../models/produto.model.js';
import Emprestimo from '../models/emprestimo.model.js';
import Pagamento from '../models/pagamento.model.js';

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
    const { idProd } = req.body;
    let codExemplar = req.body.codExemplar;
    
    if (!codExemplar && idProd) {
      const produto = await Produto.findById(idProd);
      if (produto && produto.codProd) {
        const existing = await Exemplar.find({ idProd });
        let maxSeq = 0;
        existing.forEach(ex => {
          if (ex.codExemplar && ex.codExemplar.startsWith(produto.codProd + '-')) {
            const seqStr = ex.codExemplar.replace(produto.codProd + '-', '');
            const seq = parseInt(seqStr, 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
          }
        });
        if (maxSeq === 0) maxSeq = existing.length; // fallback for un-migrated DB
        
        codExemplar = `${produto.codProd}-${String(maxSeq + 1).padStart(2, '0')}`;
      }
    }

    const exemplar = await Exemplar.create({ ...req.body, codExemplar });
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

export const purchaseExemplar = async (req, res) => {
  try {
    const exemplar = await Exemplar.findById(req.params.id);
    if (!exemplar) return res.status(404).json({ error: 'Exemplar não encontrado' });
    if (exemplar.dscStatusExemplar === 'Vendido') {
      return res.status(400).json({ error: 'Exemplar já foi vendido.' });
    }

    const emprestimoAtivo = await Emprestimo.findOne({ idExemplar: req.params.id, datEfetEntrEmpr: null, status: { $ne: 'cancelado' } });
    if (emprestimoAtivo) {
      return res.status(400).json({ error: 'Exemplar está emprestado e não pode ser vendido.' });
    }

    const produto = await Produto.findById(exemplar.idProd);
    if (!produto) return res.status(400).json({ error: 'Produto do exemplar não encontrado.' });

    const { idAssoc, dscFormPagto, valDescPagto = 0 } = req.body;
    if (!idAssoc) {
      return res.status(400).json({ error: 'Associado é obrigatório para registrar o pagamento da compra.' });
    }
    if (!dscFormPagto) {
      return res.status(400).json({ error: 'Forma de pagamento é obrigatória.' });
    }

    const desconto = Number(valDescPagto) || 0;
    const valor = Math.max(0, produto.valPrecoProd - desconto);

    const atualizado = await Exemplar.findByIdAndUpdate(req.params.id, { dscStatusExemplar: 'Vendido' }, { new: true, runValidators: true });

    await Pagamento.create({
      idExemplar: atualizado._id,
      idAssoc,
      valPagto: valor,
      dscFormPagto,
      valDescPagto: desconto,
    });

    res.json(atualizado);
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
