import mongoose from 'mongoose';

const emprestimoSchema = new mongoose.Schema({
    idAssoc: {
        type: String,
        required: [true, 'Associado é obrigatório'],
    },
    idExemplar: {
        type: String,
        required: [true, 'Exemplar é obrigatório'],
    },
    datRetEmpr: {
        type: Date,
        required: [true, 'Data de retirada é obrigatória'],
    },
    datPrevEntrEmpr: {
        type: Date,
        required: [true, 'Data prevista de entrega é obrigatória'],
    },
    datEfetEntrEmpr: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const Emprestimo = mongoose.model('Emprestimo', emprestimoSchema);

export default Emprestimo;
