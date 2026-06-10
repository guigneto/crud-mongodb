import mongoose from 'mongoose';

const emprestimoSchema = new mongoose.Schema({
    codEmpr: {
        type: String,
        unique: true,
        trim: true,
    },
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
    status: {
        type: String,
        enum: ['ativo', 'cancelado'],
        default: 'ativo',
    },
    renovacoes: {
        type: Number,
        default: 0,
    },
    motivoCancelamento: {
        type: String,
        default: null,
    },
    estadoDevolucao: {
        type: String,
        enum: ['Excelente', 'Bom', 'Danificado', 'Perdido', null],
        default: null,
    },
}, { timestamps: true });

const Emprestimo = mongoose.model('Emprestimo', emprestimoSchema);

export default Emprestimo;
