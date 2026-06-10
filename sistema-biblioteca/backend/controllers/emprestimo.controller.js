import Emprestimo from '../models/emprestimo.model.js';
import Associado from '../models/associado.model.js';
import Exemplar from '../models/exemplar.model.js';

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

export const createEmprestimo = async (req, res) => {
  try {
    const associado = await Associado.findById(req.body.idAssoc);
    if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });

    if (associado.dscTipoAssoc === 'comum') {
      const count = await Emprestimo.countDocuments({ idAssoc: req.body.idAssoc, datEfetEntrEmpr: null, status: 'ativo' });
      if (count >= 3) {
        return res.status(400).json({ error: 'Associado comum já atingiu o limite de 3 empréstimos ativos.' });
      }
    }

    const ultimoEmpr = await Emprestimo.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (ultimoEmpr && ultimoEmpr.codEmpr) {
      const parsed = parseInt(ultimoEmpr.codEmpr);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      } else {
        const match = ultimoEmpr.codEmpr.match(/E-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
    }
    req.body.codEmpr = String(nextNum);

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
    
    // Atualiza o estado físico do exemplar se ele foi devolvido
    if (req.body.datEfetEntrEmpr && req.body.estadoDevolucao) {
      await Exemplar.findByIdAndUpdate(emprestimo.idExemplar, {
        estado: req.body.estadoDevolucao
      });
    }
    
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

export const getEmprestimosAtivosByAssociado = async (req, res) => {
  try {
    const { idAssoc } = req.params;
    const count = await Emprestimo.countDocuments({ idAssoc, datEfetEntrEmpr: null, status: 'ativo' });
    res.json({ idAssoc, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const renovarEmprestimo = async (req, res) => {
  try {
    const emprestimo = await Emprestimo.findById(req.params.id);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    if (emprestimo.status === 'cancelado') {
      return res.status(400).json({ error: 'Não é possível renovar um empréstimo cancelado' });
    }
    if (emprestimo.datEfetEntrEmpr) {
      return res.status(400).json({ error: 'Não é possível renovar um empréstimo já devolvido' });
    }
    if (emprestimo.renovacoes >= 2) {
      return res.status(400).json({ error: 'Limite de 2 renovações atingido para este empréstimo' });
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataPrevista = new Date(emprestimo.datPrevEntrEmpr);
    dataPrevista.setHours(0, 0, 0, 0);
    if (hoje > dataPrevista) {
      return res.status(400).json({ error: 'Empréstimos vencidos não podem ser renovados até a devolução' });
    }

    const novaData = new Date(emprestimo.datPrevEntrEmpr);
    novaData.setDate(novaData.getDate() + 7);

    emprestimo.datPrevEntrEmpr = novaData;
    emprestimo.renovacoes += 1;
    await emprestimo.save();

    res.json(emprestimo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelarEmprestimo = async (req, res) => {
  try {
    const { motivoCancelamento } = req.body;
    if (!motivoCancelamento) {
      return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
    }

    const emprestimo = await Emprestimo.findById(req.params.id);
    if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });

    if (emprestimo.status === 'cancelado') {
      return res.status(400).json({ error: 'O empréstimo já está cancelado' });
    }
    if (emprestimo.datEfetEntrEmpr) {
      return res.status(400).json({ error: 'Não é possível cancelar um empréstimo já devolvido' });
    }

    emprestimo.status = 'cancelado';
    emprestimo.motivoCancelamento = motivoCancelamento;
    await emprestimo.save();

    res.json(emprestimo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
