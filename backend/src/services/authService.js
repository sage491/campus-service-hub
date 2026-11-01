import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const passwordMatches = (password, hash) => bcrypt.compare(password, hash);

export function createToken(user) {
  if (!env.jwtSecret) throw new AppError('Authentication is not configured on this server.', 503);
  return jwt.sign({ sub: user._id.toString(), sessionVersion: user.sessionVersion, role: user.role }, env.jwtSecret, { expiresIn: env.tokenExpiresIn });
}

export function readToken(token) {
  if (!env.jwtSecret) throw new AppError('Authentication is not configured on this server.', 503);
  try { return jwt.verify(token, env.jwtSecret); } catch { throw new AppError('Your session is invalid or has expired.', 401); }
}

export function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, studentId: user.studentId, isActive: user.isActive, createdAt: user.createdAt };
}
