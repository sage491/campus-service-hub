import User from '../models/User.js';
import { readToken } from '../services/authService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new AppError('Authentication is required.', 401);
  const token = readToken(authorization.slice(7));
  const user = await User.findById(token.sub).select('+sessionVersion').populate('department', 'name code');
  if (!user || !user.isActive || user.sessionVersion !== token.sessionVersion) throw new AppError('Your session is no longer active.', 401);
  request.user = user;
  next();
});

export function allowRoles(...roles) {
  return (request, _response, next) => roles.includes(request.user.role) ? next() : next(new AppError('You do not have permission to perform this action.', 403));
}
