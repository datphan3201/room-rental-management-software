import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/room_rental_management';

let memoryServer = null;

async function resolveMongoUri(uri) {
  if (uri) {
    return uri;
  }
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (process.env.NODE_ENV === 'test') {
    memoryServer = await MongoMemoryServer.create({
      instance: { ip: '127.0.0.1' },
    });
    return memoryServer.getUri();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production');
  }
  return DEFAULT_MONGODB_URI;
}

export async function connectDB(uri) {
  const mongoUri = await resolveMongoUri(uri);
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
