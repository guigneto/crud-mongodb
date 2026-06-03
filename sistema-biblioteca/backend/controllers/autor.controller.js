import Autor from '../models/autor.model.js';

export const getAutores = async (req, res) => {
    try {
        const autores = await Autor.find();
        res.status(200).json(autores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAutor = async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        if (!autor) {
            return res.status(404).json({ message: "Autor não encontrado" });
        }
        res.status(200).json(autor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAutor = async (req, res) => {
    try {
        const novoAutor = new Autor(req.body);
        const autorSalvo = await novoAutor.save();
        res.status(201).json(autorSalvo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateAutor = async (req, res) => {
    try {
        const autorAtualizado = await Autor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!autorAtualizado) {
            return res.status(404).json({ message: "Autor não encontrado" });
        }
        res.status(200).json(autorAtualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteAutor = async (req, res) => {
    try {
        const autorDeletado = await Autor.findByIdAndDelete(req.params.id);
        if (!autorDeletado) {
            return res.status(404).json({ message: "Autor não encontrado" });
        }
        res.status(200).json({ message: "Autor deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
