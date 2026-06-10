import Exemplar from '../models/exemplar.model.js';
import Produto from '../models/produto.model.js';

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

export const deleteExemplar = async (req, res) => {
  try {
    const exemplar = await Exemplar.findByIdAndDelete(req.params.id);
    if (!exemplar) return res.status(404).json({ error: 'Exemplar não encontrado' });
    res.json({ message: 'Exemplar removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
