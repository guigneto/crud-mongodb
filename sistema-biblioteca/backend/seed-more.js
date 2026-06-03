import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Produto from './models/produto.model.js';
import Autor from './models/autor.model.js';
import Editora from './models/editora.model.js';

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

async function seedMaisLivros() {
    try {
        await mongoose.connect(DB_URI);
        console.log('Conectado ao MongoDB!');

        // 1. Criar ou buscar Editoras
        const edIntrinseca = await Editora.findOneAndUpdate(
            { dscEditora: 'Intrínseca' }, 
            { dscEditora: 'Intrínseca' }, 
            { upsert: true, new: true }
        );
        const edParalela = await Editora.findOneAndUpdate(
            { dscEditora: 'Paralela' }, 
            { dscEditora: 'Paralela' }, 
            { upsert: true, new: true }
        );
        const edAgir = await Editora.findOneAndUpdate(
            { dscEditora: 'Agir' }, 
            { dscEditora: 'Agir' }, 
            { upsert: true, new: true }
        );

        // 2. Criar ou buscar Autores
        const johnGreen = await Autor.findOneAndUpdate(
            { nome: 'John Green' },
            { nome: 'John Green' },
            { upsert: true, returnDocument: 'after' }
        );
        const lynnPainter = await Autor.findOneAndUpdate(
            { nome: 'Lynn Painter' },
            { nome: 'Lynn Painter' },
            { upsert: true, returnDocument: 'after' }
        );
        const taylor = await Autor.findOneAndUpdate(
            { nome: 'Taylor Jenkins Reid' },
            { nome: 'Taylor Jenkins Reid' },
            { upsert: true, returnDocument: 'after' }
        );
        const antoine = await Autor.findOneAndUpdate(
            { nome: 'Antoine de Saint-Exupéry' },
            { nome: 'Antoine de Saint-Exupéry' },
            { upsert: true, returnDocument: 'after' }
        );

        // 3. Livros
        const novosLivros = [
            {
                dscTituloProd: 'Quem é Você, Alasca?',
                dscTipoProd: 'livro',
                valVendaProd: 45.90,
                valMultaDiarProd: 2.50,
                idEditora: edIntrinseca._id,
                autores: [{ idAutor: johnGreen._id, nomAutor: johnGreen.nome }]
            },
            {
                dscTituloProd: 'A Culpa é das Estrelas',
                dscTipoProd: 'livro',
                valVendaProd: 49.90,
                valMultaDiarProd: 2.50,
                idEditora: edIntrinseca._id,
                autores: [{ idAutor: johnGreen._id, nomAutor: johnGreen.nome }]
            },
            {
                dscTituloProd: 'Cidades de Papel',
                dscTipoProd: 'livro',
                valVendaProd: 42.90,
                valMultaDiarProd: 2.50,
                idEditora: edIntrinseca._id,
                autores: [{ idAutor: johnGreen._id, nomAutor: johnGreen.nome }]
            },
            {
                dscTituloProd: 'O Teorema Katherine',
                dscTipoProd: 'livro',
                valVendaProd: 39.90,
                valMultaDiarProd: 2.50,
                idEditora: edIntrinseca._id,
                autores: [{ idAutor: johnGreen._id, nomAutor: johnGreen.nome }]
            },
            {
                dscTituloProd: 'Não é como nos filmes',
                dscTipoProd: 'livro',
                valVendaProd: 55.90,
                valMultaDiarProd: 3.00,
                idEditora: edIntrinseca._id,
                autores: [{ idAutor: lynnPainter._id, nomAutor: lynnPainter.nome }]
            },
            {
                dscTituloProd: 'Os Sete Maridos de Evelyn Hugo',
                dscTipoProd: 'livro',
                valVendaProd: 59.90,
                valMultaDiarProd: 3.50,
                idEditora: edParalela._id,
                autores: [{ idAutor: taylor._id, nomAutor: taylor.nome }]
            },
            {
                dscTituloProd: 'O Pequeno Príncipe',
                dscTipoProd: 'livro',
                valVendaProd: 29.90,
                valMultaDiarProd: 1.50,
                idEditora: edAgir._id,
                autores: [{ idAutor: antoine._id, nomAutor: antoine.nome }]
            }
        ];

        let cadastrados = 0;
        for (const livro of novosLivros) {
            const existe = await Produto.findOne({ dscTituloProd: livro.dscTituloProd });
            if (!existe) {
                await Produto.create(livro);
                cadastrados++;
            }
        }

        console.log(`Sucesso! ${cadastrados} novos livros foram cadastrados no sistema.`);
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

seedMaisLivros();
