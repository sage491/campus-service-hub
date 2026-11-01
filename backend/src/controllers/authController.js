import User from '../models/User.js';
import { createToken, hashPassword, passwordMatches, publicUser } from '../services/authService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateLogin, validateProfile, validateRegistration } from '../validators/authValidators.js';

export const register = asyncHandler(async (request, response) => {
  const details = validateRegistration(request.body);
  if (await User.exists({ email: details.email })) throw new AppError('A user with that email already exists.', 409);
  const user = await User.create({ ...details, password: await hashPassword(details.password), role: 'student' });
  response.status(201).json({ token: createToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (request, response) => {
  const { email, password } = validateLogin(request.body);
  const user = await User.findOne({ email }).select('+password +sessionVersion').populate('department', 'name code');
  if (!user || !user.isActive || !(await passwordMatches(password, user.password))) throw new AppError('Email or password is incorrect.', 401);
  response.json({ token: createToken(user), user: publicUser(user) });
});

export const getCurrentUser = asyncHandler(async (request, response) => response.json({ user: publicUser(request.user) }));
export const updateProfile = asyncHandler(async (request, response) => {
  const update = validateProfile(request.body);
  const user = await User.findByIdAndUpdate(request.user._id, update, { new: true, runValidators: true }).populate('department', 'name code');
  response.json({ user: publicUser(user) });
});
export const logout = asyncHandler(async (request, response) => {
  await User.findByIdAndUpdate(request.user._id, { $inc: { sessionVersion: 1 } });
  response.status(204).send();
});
