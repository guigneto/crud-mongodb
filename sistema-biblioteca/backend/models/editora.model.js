import mongoose from 'mongoose';

const editoraSchema = new mongoose.Schema({
    dscEditora: {
        type: String,
        required: [true, 'Descrição da editora é obrigatória'],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
}, { timestamps: true });

const Editora = mongoose.model('Editora', editoraSchema);

export default Editora;
