import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
