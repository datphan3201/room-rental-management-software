import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDemoData } from './services/seed.service.js';

dotenv.config();

const port = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGODB_URI);

  const seedResult = await seedDemoData();
  if (seedResult.seeded) {
    console.log('Demo data seeded');
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://127.0.0.1:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
