import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const exemplarSchema = new mongoose.Schema({
    idProd: String,
    codExemplar: String
}, { strict: false });
const Exemplar = mongoose.model('Exemplar', exemplarSchema);

const produtoSchema = new mongoose.Schema({
    codProd: String
}, { strict: false });
const Produto = mongoose.model('Produto', produtoSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');

        const exemplares = await Exemplar.find({ estado: { $exists: false } });
        console.log(`Found ${exemplares.length} exemplares to migrate state`);

        for (const ex of exemplares) {
            await Exemplar.findByIdAndUpdate(ex._id, { estado: 'Excelente' });
            console.log(`Updated state for ${ex._id}`);
        }
        
        console.log('Migration complete');
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
