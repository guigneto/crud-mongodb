import mongoose from 'mongoose';

const multaSchema = new mongoose.Schema({
    idEmpr: {
        type: Number,
        required: [true, 'Empréstimo é obrigatório'],
    },
    dscTipMult: {
        type: String,
        required: [true, 'Tipo de multa é obrigatório'],
        enum: ['atraso', 'dano_perda'],
    },
    valMult: {
        type: Number,
        required: [true, 'Valor da multa é obrigatório'],
        min: [0, 'O valor da multa não pode ser negativo'],
    },
}, { timestamps: true });

const Multa = mongoose.model('Multa', multaSchema);

export default Multa;
