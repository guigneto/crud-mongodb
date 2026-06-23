import mongoose from 'mongoose';

const pagamentoSchema = new mongoose.Schema({
    idMult: {
        type: String,
    },
    idExemplar: {
        type: String,
    },
    idAssoc: {
        type: String,
    },
    valPagto: {
        type: Number,
        required: [true, 'Valor do pagamento é obrigatório'],
        min: [0, 'O valor do pagamento não pode ser negativo'],
    },
    dscFormPagto: {
        type: String,
        required: [true, 'Forma de pagamento é obrigatória'],
        enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'picpay', 'pix'],
    },
    valDescPagto: {
        type: Number,
        required: [true, 'Valor do desconto é obrigatório'],
        min: [0, 'O valor do desconto não pode ser negativo'],
        default: 0,
    },
}, { timestamps: true });

pagamentoSchema.pre('validate', function (next) {
    if (!this.idMult && !this.idExemplar) {
        this.invalidate('idMult', 'Pagamento deve estar associado a uma multa ou compra.');
    }
    next();
});

const Pagamento = mongoose.model('Pagamento', pagamentoSchema);

export default Pagamento;
