import mongoose from 'mongoose';

const associadoSchema = new mongoose.Schema({
    codAssoc: {
        type: String,
        unique: true,
        trim: true,
    },
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
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email do associado é obrigatório'],
    },
    telefone: {
        type: String,
        trim: true,
        required: [true, 'Telefone do associado é obrigatório'],
    },
    endereco: {
        numCEPEnder: { type: String, trim: true },
        dscNomeLogradouroEnder: { type: String, required: [true, 'Nome do logradouro é obrigatório'], trim: true },
        numNumeroEnder: { type: Number, required: [true, 'Número é obrigatório'] },
        dscComplementoEnder: { type: String, trim: true },
        dscBairroEnder: { type: String, required: [true, 'Bairro é obrigatório'], trim: true },
        dscCidadeEnder: { type: String, required: [true, 'Cidade é obrigatória'], trim: true },
        dscUFEnder: { type: String, required: [true, 'UF é obrigatório'], trim: true, minLength: 2, maxLength: 2 }
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
