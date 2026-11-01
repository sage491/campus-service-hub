import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const localEnv = resolve(process.cwd(), '.env');
const rootEnv = resolve(process.cwd(), '..', '.env');

dotenv.config({ path: existsSync(localEnv) ? localEnv : rootEnv });

export const env = {
  adminEmail: process.env.ADMIN_EMAIL?.toLowerCase(),
  adminName: process.env.ADMIN_NAME || 'Campus Administrator',
  adminPassword: process.env.ADMIN_PASSWORD,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  port: Number(process.env.PORT) || 5000,
  tokenExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
