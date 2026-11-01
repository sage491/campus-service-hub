import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import User from './models/User.js';
import { hashPassword } from './services/authService.js';

async function createBootstrapAdmin() {
  if (!env.adminEmail || !env.adminPassword) return;
  if (env.adminPassword.length < 8) throw new Error('ADMIN_PASSWORD must contain at least 8 characters.');
  if (await User.exists({ email: env.adminEmail })) return;
  await User.create({ name: env.adminName, email: env.adminEmail, password: await hashPassword(env.adminPassword), role: 'admin' });
  console.info('Bootstrap administrator created.');
}

try {
  await connectDatabase();
  if (env.mongoUri) await createBootstrapAdmin();
  app.listen(env.port, () => {
    console.info(`Campus Service Hub API listening on port ${env.port}.`);
  });
} catch (error) {
  console.error('Unable to start the server.', error);
  process.exit(1);
}
