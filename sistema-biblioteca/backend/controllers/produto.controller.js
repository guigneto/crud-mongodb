import Produto from '../models/produto.model.js';

export const getProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.status(200).json(produto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduto = async (req, res) => {
    try {
        const novoProduto = new Produto(req.body);
        const produtoSalvo = await novoProduto.save();
        res.status(201).json(produtoSalvo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduto = async (req, res) => {
    try {
        const produtoAtualizado = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!produtoAtualizado) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.status(200).json(produtoAtualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduto = async (req, res) => {
    try {
        const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
        if (!produtoDeletado) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
