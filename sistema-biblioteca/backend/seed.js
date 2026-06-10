import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Emprestimo from './models/emprestimo.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URI);
  console.log('Connected to DB.');
  
  const emprestimos = await Emprestimo.find().sort({ createdAt: 1 });
  let count = 1;
  for (const e of emprestimos) {
    if (!e.codEmpr || e.codEmpr.startsWith('E-')) {
      e.codEmpr = String(count);
      await e.save();
      console.log(`Updated Emprestimo to ${e.codEmpr}`);
      count++;
    } else {
      const num = parseInt(e.codEmpr);
      if (!isNaN(num) && num >= count) count = num + 1;
    }
  }

  console.log(`Done.`);
  process.exit(0);
}

run();
