import Produto from '../models/produto.model.js';

export const getProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        let hasMissing = false;
        for (let i = 0; i < produtos.length; i++) {
            if (!produtos[i].codProd) {
                hasMissing = true;
                break;
            }
        }
        if (hasMissing) {
            let countL = 1;
            let countP = 1;
            let countM = 1;
            for (let i = 0; i < produtos.length; i++) {
                if (produtos[i].codProd) {
                    const parts = produtos[i].codProd.split('-');
                    if (parts.length === 2) {
                        const num = parseInt(parts[1], 10);
                        if (!isNaN(num)) {
                            if (parts[0] === 'L' && num >= countL) countL = num + 1;
                            if (parts[0] === 'P' && num >= countP) countP = num + 1;
                            if (parts[0] === 'M' && num >= countM) countM = num + 1;
                        }
                    }
                }
            }
            for (let i = 0; i < produtos.length; i++) {
                if (!produtos[i].codProd) {
                    const tipo = produtos[i].dscTipoProd;
                    const prefix = tipo === 'livro' ? 'L' : (['revista', 'jornal'].includes(tipo) ? 'P' : 'M');
                    let nextNum = 1;
                    if (prefix === 'L') { nextNum = countL; countL++; }
                    else if (prefix === 'P') { nextNum = countP; countP++; }
                    else { nextNum = countM; countM++; }
                    produtos[i].codProd = `${prefix}-${String(nextNum).padStart(5, '0')}`;
                    await Produto.findByIdAndUpdate(produtos[i]._id, { codProd: produtos[i].codProd });
                }
            }
        }
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
        if (!req.body.codProd) {
            const tipo = req.body.dscTipoProd;
            const prefix = tipo === 'livro' ? 'L' : (['revista', 'jornal'].includes(tipo) ? 'P' : 'M');
            const prods = await Produto.find({ codProd: new RegExp(`^${prefix}-`) });
            let maxNum = 0;
            prods.forEach(p => {
                if (p.codProd) {
                    const parts = p.codProd.split('-');
                    if (parts.length === 2) {
                        const num = parseInt(parts[1], 10);
                        if (!isNaN(num) && num > maxNum) maxNum = num;
                    }
                }
            });
            req.body.codProd = `${prefix}-${String(maxNum + 1).padStart(5, '0')}`;
        }
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
