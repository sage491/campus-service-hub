import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const localEnv = resolve(process.cwd(), '.env');
const rootEnv = resolve(process.cwd(), '..', '.env');

dotenv.config({ path: existsSync(localEnv) ? localEnv : rootEnv });

export const env = {
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  port: Number(process.env.PORT) || 5000
};
