import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Autor from './models/autor.model.js';
import Editora from './models/editora.model.js';
import Produto from './models/produto.model.js';
import Associado from './models/associado.model.js';

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

async function seedDatabase() {
    try {
        console.log('⏳ Conectando ao banco de dados...');
        await mongoose.connect(DB_URI);
        console.log('✅ Conectado com sucesso!');

        console.log('🧹 Limpando dados antigos...');
        await Autor.deleteMany({});
        await Editora.deleteMany({});
        await Produto.deleteMany({});
        await Associado.deleteMany({});

        console.log('🌱 Criando novos dados...');

        // Criando Autores
        const autores = await Autor.insertMany([
            { nome: 'J.R.R. Tolkien', nacionalidade: 'Britânico' },
            { nome: 'George R.R. Martin', nacionalidade: 'Americano' },
            { nome: 'J.K. Rowling', nacionalidade: 'Britânica' },
            { nome: 'Isaac Asimov', nacionalidade: 'Russo-Americano' }
        ]);

        // Criando Editoras
        const editoras = await Editora.insertMany([
            { dscEditora: 'HarperCollins' },
            { dscEditora: 'Rocco' },
            { dscEditora: 'Aleph' }
        ]);

        // Criando Produtos (Livros)
        // O schema Produto espera idEditora (Number) e autores (array com idAutor Number), mas no Mongoose moderno 
        // e pelo front-end construído, deveriam ser ObjectIds referenciados se fosse ref, mas como o schema
        // exige Number para idEditora e idAutor, precisarei colocar um número.
        // Espere! No backend deles, idEditora e idAutor estão como Number. Isso é um erro conceitual do esquema relacional antigo deles
        // misturado com o MongoDB. O frontend deve estar mandando Number ou String que vira Number. 
        // Vou usar números simples como 1, 2, 3 para simular.
        
        const produtos = await Produto.insertMany([
            {
                dscTituloProd: 'O Senhor dos Anéis: A Sociedade do Anel',
                valMultaDiarProd: 2.50,
                valVendaProd: 59.90,
                dscTipoProd: 'livro',
                idEditora: 1,
                autores: [{ idAutor: 1, nomAutor: 'J.R.R. Tolkien' }]
            },
            {
                dscTituloProd: 'A Guerra dos Tronos',
                valMultaDiarProd: 3.00,
                valVendaProd: 69.90,
                dscTipoProd: 'livro',
                idEditora: 2,
                autores: [{ idAutor: 2, nomAutor: 'George R.R. Martin' }]
            },
            {
                dscTituloProd: 'Harry Potter e a Pedra Filosofal',
                valMultaDiarProd: 1.50,
                valVendaProd: 45.00,
                dscTipoProd: 'livro',
                idEditora: 2,
                autores: [{ idAutor: 3, nomAutor: 'J.K. Rowling' }]
            },
            {
                dscTituloProd: 'Fundação',
                valMultaDiarProd: 2.00,
                valVendaProd: 55.00,
                dscTipoProd: 'livro',
                idEditora: 3,
                autores: [{ idAutor: 4, nomAutor: 'Isaac Asimov' }]
            }
        ]);

        // Criando Associados
        const associados = await Associado.insertMany([
            { nomAssoc: 'João Silva', indSexoAssoc: 'M', dscEnderecoAssoc: 'Rua das Flores, 123', dscTipoAssoc: 'comum' },
            { nomAssoc: 'Maria Souza', indSexoAssoc: 'F', dscEnderecoAssoc: 'Av. Paulista, 1000', dscTipoAssoc: 'vip' },
            { nomAssoc: 'Carlos Mendes', indSexoAssoc: 'M', dscEnderecoAssoc: 'Rua Augusta, 500', dscTipoAssoc: 'comum' }
        ]);

        console.log('🎉 Banco de dados populado com sucesso!');
        console.log(`- ${autores.length} autores inseridos.`);
        console.log(`- ${editoras.length} editoras inseridas.`);
        console.log(`- ${produtos.length} produtos inseridos.`);
        console.log(`- ${associados.length} associados inseridos.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao popular o banco de dados:', error);
        process.exit(1);
    }
}

seedDatabase();
