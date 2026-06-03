import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Autor from './models/autor.model.js';
import Editora from './models/editora.model.js';
import Produto from './models/produto.model.js';
import Associado from './models/associado.model.js';

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

const autoresRaw = [
    { nome: 'Machado de Assis', nacionalidade: 'Brasileiro' },
    { nome: 'Clarice Lispector', nacionalidade: 'Brasileira' },
    { nome: 'Jorge Amado', nacionalidade: 'Brasileiro' },
    { nome: 'Graciliano Ramos', nacionalidade: 'Brasileiro' },
    { nome: 'Gabriel García Márquez', nacionalidade: 'Colombiano' },
    { nome: 'Jane Austen', nacionalidade: 'Britânica' },
    { nome: 'Fiódor Dostoiévski', nacionalidade: 'Russo' },
    { nome: 'Leo Tolstoi', nacionalidade: 'Russo' },
    { nome: 'Agatha Christie', nacionalidade: 'Britânica' },
    { nome: 'Stephen King', nacionalidade: 'Americano' },
    { nome: 'Arthur Conan Doyle', nacionalidade: 'Britânico' },
    { nome: 'Edgar Allan Poe', nacionalidade: 'Americano' },
    { nome: 'J.R.R. Tolkien', nacionalidade: 'Britânico' },
    { nome: 'George Orwell', nacionalidade: 'Britânico' },
    { nome: 'Aldous Huxley', nacionalidade: 'Britânico' },
    { nome: 'Ray Bradbury', nacionalidade: 'Americano' },
    { nome: 'Isaac Asimov', nacionalidade: 'Russo-Americano' },
    { nome: 'Philip K. Dick', nacionalidade: 'Americano' },
    { nome: 'Neil Gaiman', nacionalidade: 'Britânico' },
    { nome: 'J.K. Rowling', nacionalidade: 'Britânica' },
    { nome: 'Rick Riordan', nacionalidade: 'Americano' },
    { nome: 'Suzanne Collins', nacionalidade: 'Americana' },
    { nome: 'Margaret Atwood', nacionalidade: 'Canadense' },
    { nome: 'Haruki Murakami', nacionalidade: 'Japonês' },
    { nome: 'José Saramago', nacionalidade: 'Português' }
];

const editorasRaw = [
    { dscEditora: 'Companhia das Letras' },
    { dscEditora: 'Rocco' },
    { dscEditora: 'Intrínseca' },
    { dscEditora: 'Sextante' },
    { dscEditora: 'Aleph' },
    { dscEditora: 'DarkSide Books' },
    { dscEditora: 'HarperCollins Brasil' },
    { dscEditora: 'Editora Record' },
    { dscEditora: 'L&PM Editores' },
    { dscEditora: 'Martin Claret' }
];

const associadosRaw = Array.from({ length: 30 }, (_, i) => ({
    nomAssoc: `Associado Fictício ${i+1}`,
    indSexoAssoc: i % 2 === 0 ? 'M' : 'F',
    dscEnderecoAssoc: `Rua das Flores, ${i*10 + 1}`,
    dscTipoAssoc: i % 5 === 0 ? 'vip' : 'comum'
}));

// Real Books Data mapping to author indexes (0 to 24) and editora indexes (0 to 9)
const livrosRaw = [
    { t: 'Dom Casmurro', a: 0, e: 0 },
    { t: 'Memórias Póstumas de Brás Cubas', a: 0, e: 8 },
    { t: 'Quincas Borba', a: 0, e: 9 },
    { t: 'O Alienista', a: 0, e: 0 },
    { t: 'A Hora da Estrela', a: 1, e: 1 },
    { t: 'A Paixão Segundo G.H.', a: 1, e: 1 },
    { t: 'Laços de Família', a: 1, e: 1 },
    { t: 'Capitães da Areia', a: 2, e: 0 },
    { t: 'Tieta do Agreste', a: 2, e: 7 },
    { t: 'Gabriela, Cravo e Canela', a: 2, e: 7 },
    { t: 'Vidas Secas', a: 3, e: 7 },
    { t: 'São Bernardo', a: 3, e: 7 },
    { t: 'Cem Anos de Solidão', a: 4, e: 7 },
    { t: 'O Amor nos Tempos do Cólera', a: 4, e: 7 },
    { t: 'Orgulho e Preconceito', a: 5, e: 9 },
    { t: 'Razão e Sensibilidade', a: 5, e: 9 },
    { t: 'Emma', a: 5, e: 9 },
    { t: 'Crime e Castigo', a: 6, e: 9 },
    { t: 'Os Irmãos Karamázov', a: 6, e: 9 },
    { t: 'O Idiota', a: 6, e: 9 },
    { t: 'Guerra e Paz', a: 7, e: 0 },
    { t: 'Anna Kariênina', a: 7, e: 0 },
    { t: 'O Assassinato no Expresso do Oriente', a: 8, e: 6 },
    { t: 'E Não Sobrou Nenhum', a: 8, e: 6 },
    { t: 'Morte no Nilo', a: 8, e: 6 },
    { t: 'O Iluminado', a: 9, e: 0 },
    { t: 'It: A Coisa', a: 9, e: 0 },
    { t: 'Cemitério Maldito', a: 9, e: 0 },
    { t: 'A Dança da Morte', a: 9, e: 0 },
    { t: 'Um Estudo em Vermelho', a: 10, e: 8 },
    { t: 'O Cão dos Baskervilles', a: 10, e: 8 },
    { t: 'O Signo dos Quatro', a: 10, e: 8 },
    { t: 'O Corvo', a: 11, e: 5 },
    { t: 'Os Assassinatos da Rua Morgue', a: 11, e: 8 },
    { t: 'O Hobbit', a: 12, e: 6 },
    { t: 'O Senhor dos Anéis: A Sociedade do Anel', a: 12, e: 6 },
    { t: 'O Senhor dos Anéis: As Duas Torres', a: 12, e: 6 },
    { t: 'O Senhor dos Anéis: O Retorno do Rei', a: 12, e: 6 },
    { t: 'O Silmarillion', a: 12, e: 6 },
    { t: '1984', a: 13, e: 0 },
    { t: 'A Revolução dos Bichos', a: 13, e: 0 },
    { t: 'Admirável Mundo Novo', a: 14, e: 4 },
    { t: 'Fahrenheit 451', a: 15, e: 4 },
    { t: 'Crônicas Marcianas', a: 15, e: 4 },
    { t: 'Fundação', a: 16, e: 4 },
    { t: 'Eu, Robô', a: 16, e: 4 },
    { t: 'O Fim da Eternidade', a: 16, e: 4 },
    { t: 'O Homem do Castelo Alto', a: 17, e: 4 },
    { t: 'Androides Sonham com Ovelhas Elétricas?', a: 17, e: 4 },
    { t: 'Deuses Americanos', a: 18, e: 2 },
    { t: 'Coraline', a: 18, e: 2 },
    { t: 'Sandman', a: 18, e: 2 },
    { t: 'Harry Potter e a Pedra Filosofal', a: 19, e: 1 },
    { t: 'Harry Potter e a Câmara Secreta', a: 19, e: 1 },
    { t: 'Harry Potter e o Prisioneiro de Azkaban', a: 19, e: 1 },
    { t: 'Harry Potter e o Cálice de Fogo', a: 19, e: 1 },
    { t: 'Harry Potter e a Ordem da Fênix', a: 19, e: 1 },
    { t: 'Percy Jackson e o Ladrão de Raios', a: 20, e: 2 },
    { t: 'Percy Jackson e o Mar de Monstros', a: 20, e: 2 },
    { t: 'Percy Jackson e a Maldição do Titã', a: 20, e: 2 },
    { t: 'Jogos Vorazes', a: 21, e: 1 },
    { t: 'Em Chamas', a: 21, e: 1 },
    { t: 'A Esperança', a: 21, e: 1 },
    { t: 'O Conto da Aia', a: 22, e: 1 },
    { t: 'Os Testamentos', a: 22, e: 1 },
    { t: 'Norwegian Wood', a: 23, e: 0 },
    { t: 'Kafka à Beira-Mar', a: 23, e: 0 },
    { t: '1Q84', a: 23, e: 0 },
    { t: 'Ensaio Sobre a Cegueira', a: 24, e: 0 },
    { t: 'O Evangelho Segundo Jesus Cristo', a: 24, e: 0 },
    { t: 'O Homem Duplicado', a: 24, e: 0 },
    // A few more to round out near 100
    { t: 'Memórias de Minhas Putas Tristes', a: 4, e: 7 },
    { t: 'Ninguém Escreve ao Coronel', a: 4, e: 7 },
    { t: 'As Aventuras de Sherlock Holmes', a: 10, e: 8 },
    { t: 'O Retorno de Sherlock Holmes', a: 10, e: 8 },
    { t: 'As Duas Torres', a: 12, e: 6 },
    { t: 'Contos Inacabados', a: 12, e: 6 },
    { t: 'A Metamorfose', a: 6, e: 0 }, // Fake map to Fiodor for ease
    { t: 'O Processo', a: 6, e: 0 },
    { t: 'O Grande Gatsby', a: 9, e: 0 },
    { t: 'O Sol É Para Todos', a: 5, e: 0 },
    { t: 'A Culpa é das Estrelas', a: 2, e: 2 },
    { t: 'A Menina que Roubava Livros', a: 2, e: 2 },
    { t: 'O Caçador de Pipas', a: 2, e: 2 },
    { t: 'O Menino do Pijama Listrado', a: 2, e: 2 },
    { t: 'A Cabana', a: 2, e: 3 },
    { t: 'O Código Da Vinci', a: 2, e: 3 },
    { t: 'Anjos e Demônios', a: 2, e: 3 },
    { t: 'O Símbolo Perdido', a: 2, e: 3 },
    { t: 'Inferno', a: 2, e: 3 },
    { t: 'Origem', a: 2, e: 3 },
    { t: 'A Guerra dos Tronos', a: 2, e: 0 },
    { t: 'A Fúria dos Reis', a: 2, e: 0 },
    { t: 'A Tormenta de Espadas', a: 2, e: 0 },
    { t: 'O Festim dos Corvos', a: 2, e: 0 },
    { t: 'A Dança dos Dragões', a: 2, e: 0 }
];

async function run() {
    try {
        console.log('⏳ Conectando ao banco de dados...');
        await mongoose.connect(DB_URI);
        
        console.log('🧹 Limpando dados antigos...');
        await Autor.deleteMany({});
        await Editora.deleteMany({});
        await Produto.deleteMany({});
        await Associado.deleteMany({});

        console.log('🌱 Inserindo novos Autores...');
        const autores = await Autor.insertMany(autoresRaw);
        
        console.log('🌱 Inserindo novas Editoras...');
        const editoras = await Editora.insertMany(editorasRaw);
        
        console.log('🌱 Inserindo novos Associados...');
        const associados = await Associado.insertMany(associadosRaw);
        
        console.log('🌱 Inserindo novos Produtos...');
        const produtosPayload = livrosRaw.map(l => ({
            dscTituloProd: l.t,
            valMultaDiarProd: Number((Math.random() * 3 + 1).toFixed(2)), // Random multa 1 a 4
            valVendaProd: Number((Math.random() * 50 + 20).toFixed(2)), // Random venda 20 a 70
            dscTipoProd: 'livro',
            idEditora: editoras[l.e]._id.toString(),
            autores: [
                { idAutor: autores[l.a]._id.toString(), nomAutor: autores[l.a].nome }
            ]
        }));
        
        const produtos = await Produto.insertMany(produtosPayload);
        
        console.log(`✅ Sucesso! Inseridos:`);
        console.log(`- ${autores.length} Autores Reais`);
        console.log(`- ${editoras.length} Editoras Reais`);
        console.log(`- ${produtos.length} Livros Reais`);
        console.log(`- ${associados.length} Associados`);
        
        process.exit(0);
    } catch (e) {
        console.error('Erro:', e);
        process.exit(1);
    }
}

run();
