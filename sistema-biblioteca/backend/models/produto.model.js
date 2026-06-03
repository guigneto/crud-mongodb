import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
    dscTituloProd: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        minLength: 2,
        maxLength: 150,
    },
    valMultaDiarProd: {
        type: Number,
        required: [true, 'Valor de multa diária é obrigatório'],
        min: [0, 'O valor da multa diária não pode ser negativo'],
        default: 0,
    },
    valVendaProd: {
        type: Number,
        required: [true, 'Valor de venda é obrigatório'],
        min: [0, 'O valor de venda não pode ser negativo'],
    },
    dscTipoProd: {
        type: String,
        required: [true, 'Tipo de produto é obrigatório'],
        enum: ['livro', 'cd', 'dvd', 'revista', 'jornal', 'nuvem'],
    },
    dscFormatoProd: {
        type: String,
        enum: ['pdf', 'video'],
        default: null,
    },
    idEditora: {
        type: String,
        required: [true, 'Editora é obrigatória'],
    },
    autores: [
        {
            idAutor: {
                type: String,
                required: true,
            },
            nomAutor: {
                type: String,
                required: true,
                trim: true,
                minLength: 2,
                maxLength: 100,
            },
        }
    ],
    exemplares: [
        {
            idExemplar: {
                type: String,
                required: true,
            },
        }
    ],
}, { timestamps: true });

const Produto = mongoose.model('Produto', produtoSchema);

export default Produto;
