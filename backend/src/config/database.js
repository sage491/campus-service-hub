import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not set. Starting API without a database connection.');
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.info('MongoDB connected.');
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
