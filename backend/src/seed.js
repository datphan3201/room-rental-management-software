import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDemoData } from './services/seed.service.js';

dotenv.config();

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/room_rental_management';

async function seed() {
  await connectDB(process.env.MONGODB_URI || DEFAULT_MONGODB_URI);
  const result = await seedDemoData({ reset: true });

  console.log('Seed complete');
  console.log(result);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
