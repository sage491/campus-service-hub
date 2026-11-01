import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function requireDatabase(_request, _response, next) {
  if (mongoose.connection.readyState !== 1) return next(new AppError('Database service is unavailable.', 503));
  next();
}
