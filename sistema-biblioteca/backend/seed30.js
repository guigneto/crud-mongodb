import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Produto from './models/produto.model.js';
import Autor from './models/autor.model.js';
import Editora from './models/editora.model.js';

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

async function seed30Produtos() {
    try {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('Conectado com sucesso!');

        // --- 1. POPULAR EDITORAS ---
        const editorasParaCriar = [
            'Carambaia', 'Rocco', 'HarperCollins', 'Companhia das Letras', 'Sextante', 
            'L&PM', 'Arqueiro', 'Intrínseca', 'Record', 'Alta Books', 'EMI', 'Epic Records', 
            'Odeon', 'Apple Records', 'Paramount', 'Warner Home Video', 'VideoFilmes', 
            'New Line', 'Studio Ghibli', 'Abril', 'National Geographic', 'Empresa Folha da Manhã', 
            'Grupo Estado', 'Casa do Código', 'Udemy', 'Coursera'
        ];

        const editorasMap = {};
        for (const nomeEd of editorasParaCriar) {
            const ed = await Editora.findOneAndUpdate(
                { dscEditora: nomeEd },
                { dscEditora: nomeEd },
                { upsert: true, new: true }
            );
            editorasMap[nomeEd] = ed._id.toString();
        }
        console.log('Editoras preparadas.');

        // --- 2. POPULAR AUTORES ---
        const autoresParaCriar = [
            'Machado de Assis', 'J.K. Rowling', 'J.R.R. Tolkien', 'George Orwell', 'Paulo Coelho',
            'Yuval Noah Harari', 'Dan Brown', 'Stephen Hawking', 'Clarice Lispector', 'Gabriel García Márquez',
            'Robert C. Martin', 'Pink Floyd', 'Michael Jackson', 'Milton Nascimento', 'The Beatles',
            'João Gilberto', 'Francis Ford Coppola', 'Lana Wachowski', 'Walter Salles', 'Peter Jackson',
            'Hayao Miyazaki', 'Redação Abril', 'Redação National Geographic', 'Redação Folha', 'Redação Estadão',
            'Antigravity AI', 'Prof. Silva', 'Andrew Ng'
        ];

        const autoresMap = {};
        for (const nomeAut of autoresParaCriar) {
            const aut = await Autor.findOneAndUpdate(
                { nome: nomeAut },
                { nome: nomeAut },
                { upsert: true, new: true }
            );
            autoresMap[nomeAut] = { id: aut._id.toString(), nome: aut.nome };
        }
        console.log('Autores preparados.');

        // --- 3. PRODUTOS DIVERSOS ---
        const produtos = [
            // --- LIVROS (12) ---
            {
                dscTituloProd: 'Dom Casmurro',
                dscTipoProd: 'livro',
                valVendaProd: 49.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['Carambaia'],
                numAnoPublProd: 1899,
                numISBNProd: '9788569002222',
                dscCategoriaProd: 'Literatura Clássica',
                autores: [autoresMap['Machado de Assis']]
            },
            {
                dscTituloProd: 'Harry Potter e a Pedra Filosofal',
                dscTipoProd: 'livro',
                valVendaProd: 54.90,
                valMultaDiarProd: 2.50,
                idEditora: editorasMap['Rocco'],
                numAnoPublProd: 1997,
                numISBNProd: '9788532511010',
                dscCategoriaProd: 'Fantasia',
                autores: [autoresMap['J.K. Rowling']]
            },
            {
                dscTituloProd: 'O Senhor dos Anéis: A Sociedade do Anel',
                dscTipoProd: 'livro',
                valVendaProd: 69.90,
                valMultaDiarProd: 3.00,
                idEditora: editorasMap['HarperCollins'],
                numAnoPublProd: 1954,
                numISBNProd: '9788595086357',
                dscCategoriaProd: 'Fantasia',
                autores: [autoresMap['J.R.R. Tolkien']]
            },
            {
                dscTituloProd: '1984',
                dscTipoProd: 'livro',
                valVendaProd: 39.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['Companhia das Letras'],
                numAnoPublProd: 1949,
                numISBNProd: '9788535914849',
                dscCategoriaProd: 'Ficção Científica',
                autores: [autoresMap['George Orwell']]
            },
            {
                dscTituloProd: 'O Alquimista',
                dscTipoProd: 'livro',
                valVendaProd: 34.90,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Sextante'],
                numAnoPublProd: 1988,
                numISBNProd: '9788575427583',
                dscCategoriaProd: 'Romance',
                autores: [autoresMap['Paulo Coelho']]
            },
            {
                dscTituloProd: 'Sapiens: Uma Breve História da Humanidade',
                dscTipoProd: 'livro',
                valVendaProd: 59.90,
                valMultaDiarProd: 2.50,
                idEditora: editorasMap['L&PM'],
                numAnoPublProd: 2011,
                numISBNProd: '9788525432186',
                dscCategoriaProd: 'História',
                autores: [autoresMap['Yuval Noah Harari']]
            },
            {
                dscTituloProd: 'O Código Da Vinci',
                dscTipoProd: 'livro',
                valVendaProd: 44.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['Arqueiro'],
                numAnoPublProd: 2003,
                numISBNProd: '9788599296035',
                dscCategoriaProd: 'Suspense',
                autores: [autoresMap['Dan Brown']]
            },
            {
                dscTituloProd: 'Uma Breve História do Tempo',
                dscTipoProd: 'livro',
                valVendaProd: 49.90,
                valMultaDiarProd: 2.50,
                idEditora: editorasMap['Intrínseca'],
                numAnoPublProd: 1988,
                numISBNProd: '9788580576436',
                dscCategoriaProd: 'Ciências',
                autores: [autoresMap['Stephen Hawking']]
            },
            {
                dscTituloProd: 'A Hora da Estrela',
                dscTipoProd: 'livro',
                valVendaProd: 29.95,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Rocco'],
                numAnoPublProd: 1977,
                numISBNProd: '9788532508102',
                dscCategoriaProd: 'Literatura Brasileira',
                autores: [autoresMap['Clarice Lispector']]
            },
            {
                dscTituloProd: 'Cem Anos de Solidão',
                dscTipoProd: 'livro',
                valVendaProd: 64.90,
                valMultaDiarProd: 3.00,
                idEditora: editorasMap['Record'],
                numAnoPublProd: 1967,
                numISBNProd: '9788501012050',
                dscCategoriaProd: 'Literatura Latino-americana',
                autores: [autoresMap['Gabriel García Márquez']]
            },
            {
                dscTituloProd: 'O Hobbit',
                dscTipoProd: 'livro',
                valVendaProd: 49.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['HarperCollins'],
                numAnoPublProd: 1937,
                numISBNProd: '9788595085817',
                dscCategoriaProd: 'Fantasia',
                autores: [autoresMap['J.R.R. Tolkien']]
            },
            {
                dscTituloProd: 'Clean Code',
                dscTipoProd: 'livro',
                valVendaProd: 89.90,
                valMultaDiarProd: 4.00,
                idEditora: editorasMap['Alta Books'],
                numAnoPublProd: 2008,
                numISBNProd: '9788576082644',
                dscCategoriaProd: 'Tecnologia',
                autores: [autoresMap['Robert C. Martin']]
            },

            // --- CDs (5) ---
            {
                dscTituloProd: 'The Dark Side of the Moon',
                dscTipoProd: 'cd',
                valVendaProd: 39.90,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['EMI'],
                numAnoPublProd: 1973,
                dscCategoriaProd: 'Rock',
                autores: [autoresMap['Pink Floyd']]
            },
            {
                dscTituloProd: 'Thriller',
                dscTipoProd: 'cd',
                valVendaProd: 35.00,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Epic Records'],
                numAnoPublProd: 1982,
                dscCategoriaProd: 'Pop',
                autores: [autoresMap['Michael Jackson']]
            },
            {
                dscTituloProd: 'Clube da Esquina',
                dscTipoProd: 'cd',
                valVendaProd: 45.00,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Odeon'],
                numAnoPublProd: 1972,
                dscCategoriaProd: 'MPB',
                autores: [autoresMap['Milton Nascimento']]
            },
            {
                dscTituloProd: 'Abbey Road',
                dscTipoProd: 'cd',
                valVendaProd: 49.90,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Apple Records'],
                numAnoPublProd: 1969,
                dscCategoriaProd: 'Rock',
                autores: [autoresMap['The Beatles']]
            },
            {
                dscTituloProd: 'Chega de Saudade',
                dscTipoProd: 'cd',
                valVendaProd: 29.90,
                valMultaDiarProd: 1.00,
                idEditora: editorasMap['Odeon'],
                numAnoPublProd: 1959,
                dscCategoriaProd: 'Bossa Nova',
                autores: [autoresMap['João Gilberto']]
            },

            // --- DVDs (5) ---
            {
                dscTituloProd: 'O Poderoso Chefão',
                dscTipoProd: 'dvd',
                valVendaProd: 29.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['Paramount'],
                numAnoPublProd: 1972,
                dscCategoriaProd: 'Cinema / Drama',
                autores: [autoresMap['Francis Ford Coppola']]
            },
            {
                dscTituloProd: 'Matrix',
                dscTipoProd: 'dvd',
                valVendaProd: 24.90,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Warner Home Video'],
                numAnoPublProd: 1999,
                dscCategoriaProd: 'Cinema / Ficção Científica',
                autores: [autoresMap['Lana Wachowski']]
            },
            {
                dscTituloProd: 'Central do Brasil',
                dscTipoProd: 'dvd',
                valVendaProd: 19.90,
                valMultaDiarProd: 1.00,
                idEditora: editorasMap['VideoFilmes'],
                numAnoPublProd: 1998,
                dscCategoriaProd: 'Cinema Nacional',
                autores: [autoresMap['Walter Salles']]
            },
            {
                dscTituloProd: 'O Senhor dos Anéis: O Retorno do Rei',
                dscTipoProd: 'dvd',
                valVendaProd: 34.90,
                valMultaDiarProd: 2.00,
                idEditora: editorasMap['New Line'],
                numAnoPublProd: 2003,
                dscCategoriaProd: 'Cinema / Fantasia',
                autores: [autoresMap['Peter Jackson']]
            },
            {
                dscTituloProd: 'A Viagem de Chihiro',
                dscTipoProd: 'dvd',
                valVendaProd: 29.90,
                valMultaDiarProd: 1.50,
                idEditora: editorasMap['Studio Ghibli'],
                numAnoPublProd: 2001,
                dscCategoriaProd: 'Animação',
                autores: [autoresMap['Hayao Miyazaki']]
            },

            // --- REVISTAS (3) ---
            {
                dscTituloProd: 'Revista Superinteressante - Edição 450',
                dscTipoProd: 'revista',
                valVendaProd: 19.90,
                valMultaDiarProd: 1.00,
                idEditora: editorasMap['Abril'],
                numAnoPublProd: 2023,
                dscCategoriaProd: 'Curiosidades e Ciências',
                autores: [autoresMap['Redação Abril']]
            },
            {
                dscTituloProd: 'National Geographic Brasil - Outubro 2023',
                dscTipoProd: 'revista',
                valVendaProd: 22.90,
                valMultaDiarProd: 1.00,
                idEditora: editorasMap['National Geographic'],
                numAnoPublProd: 2023,
                dscCategoriaProd: 'Geografia e Natureza',
                autores: [autoresMap['Redação National Geographic']]
            },
            {
                dscTituloProd: 'Revista Veja - Edição 2800',
                dscTipoProd: 'revista',
                valVendaProd: 18.00,
                valMultaDiarProd: 1.00,
                idEditora: editorasMap['Abril'],
                numAnoPublProd: 2023,
                dscCategoriaProd: 'Notícias',
                autores: [autoresMap['Redação Abril']]
            },

            // --- JORNAIS (2) ---
            {
                dscTituloProd: 'Folha de S.Paulo - 03/06/2026',
                dscTipoProd: 'jornal',
                valVendaProd: 8.00,
                valMultaDiarProd: 0.50,
                idEditora: editorasMap['Empresa Folha da Manhã'],
                numAnoPublProd: 2026,
                dscCategoriaProd: 'Notícias diárias',
                autores: [autoresMap['Redação Folha']]
            },
            {
                dscTituloProd: 'O Estado de S. Paulo - 03/06/2026',
                dscTipoProd: 'jornal',
                valVendaProd: 8.50,
                valMultaDiarProd: 0.50,
                idEditora: editorasMap['Grupo Estado'],
                numAnoPublProd: 2026,
                dscCategoriaProd: 'Notícias diárias',
                autores: [autoresMap['Redação Estadão']]
            },

            // --- NUVEM (3) ---
            {
                dscTituloProd: 'Manual do Desenvolvedor React (E-Book)',
                dscTipoProd: 'nuvem',
                dscFormatoProd: 'pdf',
                valVendaProd: 15.00,
                valMultaDiarProd: 0.00,
                idEditora: editorasMap['Casa do Código'],
                numAnoPublProd: 2025,
                dscCategoriaProd: 'Tecnologia',
                autores: [autoresMap['Antigravity AI']]
            },
            {
                dscTituloProd: 'Introdução a Banco de Dados Relacionais (Curso de Vídeo)',
                dscTipoProd: 'nuvem',
                dscFormatoProd: 'video',
                valVendaProd: 39.90,
                valMultaDiarProd: 0.00,
                idEditora: editorasMap['Udemy'],
                numAnoPublProd: 2024,
                dscCategoriaProd: 'Tecnologia',
                autores: [autoresMap['Prof. Silva']]
            },
            {
                dscTituloProd: 'Guia Completo de Machine Learning (E-Book)',
                dscTipoProd: 'nuvem',
                dscFormatoProd: 'pdf',
                valVendaProd: 0.00,
                valMultaDiarProd: 0.00,
                idEditora: editorasMap['Coursera'],
                numAnoPublProd: 2023,
                dscCategoriaProd: 'Tecnologia',
                autores: [autoresMap['Andrew Ng']]
            }
        ];

        // --- 4. GRAVAR NO BANCO ---
        let cadastrados = 0;
        for (const pData of produtos) {
            const existe = await Produto.findOne({ dscTituloProd: pData.dscTituloProd });
            if (!existe) {
                // Formatar subdocumento autores corretamento com chave idAutor/nomAutor
                const formattedAutores = pData.autores.map(aut => ({
                    idAutor: aut.id,
                    nomAutor: aut.nome
                }));

                await Produto.create({
                    dscTituloProd: pData.dscTituloProd,
                    dscTipoProd: pData.dscTipoProd,
                    dscFormatoProd: pData.dscFormatoProd || null,
                    valVendaProd: pData.valVendaProd,
                    valMultaDiarProd: pData.valMultaDiarProd,
                    idEditora: pData.idEditora,
                    numAnoPublProd: pData.numAnoPublProd || null,
                    numISBNProd: pData.numISBNProd || null,
                    dscCategoriaProd: pData.dscCategoriaProd || null,
                    autores: formattedAutores
                });
                cadastrados++;
            }
        }

        console.log(`Sucesso! ${cadastrados} novos produtos reais cadastrados no acervo.`);
        process.exit(0);
    } catch (error) {
        console.error('Erro ao popular produtos:', error);
        process.exit(1);
    }
}

seed30Produtos();
