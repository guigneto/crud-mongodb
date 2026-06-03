import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Exemplar from './models/exemplar.model.js';

dotenv.config();
const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

async function test() {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to DB');
        const ex = await Exemplar.create({ idProd: "6a1f20249ce81d7cec05f6f0" });
        console.log('Successfully created:', ex);
        process.exit(0);
    } catch (err) {
        console.error('Error creating exemplar:', err);
        process.exit(1);
    }
}
test();
