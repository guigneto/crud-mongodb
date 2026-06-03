import mongoose from 'mongoose';

const associadoSchema = new mongoose.Schema({
    nomAssoc: {
        type: String,
        required: [true, 'Nome do associado é obrigatório'],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    indSexoAssoc: {
        type: String,
        required: [true, 'Sexo do associado é obrigatório'],
        enum: ['M', 'F'],
    },
    dscEnderecoAssoc: {
        type: String,
        required: [true, 'Endereço é obrigatório'],
        trim: true,
        minLength: 5,
        maxLength: 200,
    },
    dscTipoAssoc: {
        type: String,
        required: [true, 'Tipo de associado é obrigatório'],
        enum: ['comum', 'vip'],
        default: 'comum',
    },
}, { timestamps: true });

const Associado = mongoose.model('Associado', associadoSchema);

export default Associado;
