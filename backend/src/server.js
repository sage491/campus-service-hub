import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
  app.listen(env.port, () => {
    console.info(`Campus Service Hub API listening on port ${env.port}.`);
  });
} catch (error) {
  console.error('Unable to start the server.', error);
  process.exit(1);
}
