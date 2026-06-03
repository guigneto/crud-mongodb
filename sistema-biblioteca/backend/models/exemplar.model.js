import mongoose from 'mongoose';

const exemplarSchema = new mongoose.Schema({
    idProd: {
        type: String,
        required: [true, 'Produto é obrigatório'],
    },
}, { timestamps: true });

const Exemplar = mongoose.model('Exemplar', exemplarSchema);

export default Exemplar;
