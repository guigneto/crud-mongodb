import mongoose from 'mongoose';
import { DB_URI } from '../config/env.js';

const connectToDatabase = async () => {
  try {
    if (!DB_URI) {
      throw new Error("A variável de ambiente DB_URI deve estar definida no arquivo .env");
    }

    await mongoose.connect(DB_URI);
    console.log(`Conectado ao MongoDB com sucesso!`);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB: ', error);
    process.exit(1);
  }
};

export default connectToDatabase;
