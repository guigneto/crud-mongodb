import mongoose from 'mongoose';

const exemplarSchema = new mongoose.Schema({
    idProd: {
        type: String,
        required: [true, 'Produto é obrigatório'],
    },
    codExemplar: {
        type: String,
        unique: true,
        sparse: true
    },
    estado: {
        type: String,
        enum: ['Excelente', 'Bom', 'Danificado', 'Perdido'],
        default: 'Excelente'
    },
    dscStatusExemplar: {
        type: String,
        enum: ['Disponível', 'Emprestado', 'Vendido'],
        default: 'Disponível'
    },
}, { timestamps: true });

const Exemplar = mongoose.model('Exemplar', exemplarSchema);

export default Exemplar;
