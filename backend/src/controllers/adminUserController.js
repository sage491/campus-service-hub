import User from '../models/User.js';
import { hashPassword, publicUser } from '../services/authService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateRegistration } from '../validators/authValidators.js';

export const createUser = asyncHandler(async (request, response) => {
  const details = validateRegistration(request.body);
  const role = request.body.role;
  if (!['student', 'faculty', 'admin'].includes(role)) throw new AppError('Choose a valid role.', 400);
  if (await User.exists({ email: details.email })) throw new AppError('A user with that email already exists.', 409);
  const user = await User.create({ ...details, password: await hashPassword(details.password), role });
  response.status(201).json({ user: publicUser(user) });
});

export const listUsers = asyncHandler(async (request, response) => {
  const filter = {};
  if (['student', 'faculty', 'admin'].includes(request.query.role)) filter.role = request.query.role;
  if (request.query.q?.trim()) {
    const search = new RegExp(request.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: search }, { email: search }, { studentId: search }];
  }
  const users = await User.find(filter).select('-password -sessionVersion').populate('department', 'name code').sort({ name: 1 });
  response.json({ users: users.map(publicUser) });
});

export const updateUser = asyncHandler(async (request, response) => {
  const allowed = ['name', 'department', 'studentId', 'isActive'];
  const update = {};
  for (const key of allowed) if (request.body[key] !== undefined) update[key] = request.body[key];
  if (request.body.role !== undefined) {
    if (!['student', 'faculty', 'admin'].includes(request.body.role)) throw new AppError('Choose a valid role.', 400);
    update.role = request.body.role;
  }
  if (!Object.keys(update).length) throw new AppError('Provide a user field to update.', 400);
  if (request.params.id === request.user._id.toString() && update.isActive === false) throw new AppError('You cannot deactivate your own account.', 400);
  const user = await User.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true }).populate('department', 'name code');
  if (!user) throw new AppError('User not found.', 404);
  response.json({ user: publicUser(user) });
});
