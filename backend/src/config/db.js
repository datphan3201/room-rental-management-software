import { closeStore, initStore } from '../data/store.js';

export async function connectDB() {
  await initStore();
  console.log('Local data store ready');
  return true;
}

export async function disconnectDB() {
  await closeStore();
}
