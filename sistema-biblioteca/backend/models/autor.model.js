import mongoose from 'mongoose';

const autorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    nacionalidade: {
        type: String,
        required: [false, 'Nacionalidade é opcional'],
    }
}, { timestamps: true });

const Autor = mongoose.model('Autor', autorSchema);

export default Autor;
