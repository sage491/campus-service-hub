import AppError from '../utils/AppError.js';

const emailPattern = /^\S+@\S+\.\S+$/;

export function validateRegistration(body) {
  const { name, email, password, studentId = '', department } = body;
  if (!name?.trim() || name.trim().length > 80) throw new AppError('Name must be between 1 and 80 characters.', 400);
  if (!emailPattern.test(email || '')) throw new AppError('Enter a valid email address.', 400);
  if (typeof password !== 'string' || password.length < 8) throw new AppError('Password must contain at least 8 characters.', 400);
  if (studentId && (typeof studentId !== 'string' || studentId.length > 40)) throw new AppError('Student ID is too long.', 400);
  return { name: name.trim(), email: email.trim().toLowerCase(), password, studentId: studentId.trim(), department: department || null };
}

export function validateLogin(body) {
  if (!emailPattern.test(body.email || '') || typeof body.password !== 'string' || !body.password) throw new AppError('Enter a valid email and password.', 400);
  return { email: body.email.trim().toLowerCase(), password: body.password };
}

export function validateProfile(body) {
  const update = {};
  if (body.name !== undefined) {
    if (!body.name?.trim() || body.name.trim().length > 80) throw new AppError('Name must be between 1 and 80 characters.', 400);
    update.name = body.name.trim();
  }
  if (body.studentId !== undefined) {
    if (typeof body.studentId !== 'string' || body.studentId.length > 40) throw new AppError('Student ID is too long.', 400);
    update.studentId = body.studentId.trim();
  }
  if (body.department !== undefined) update.department = body.department || null;
  if (!Object.keys(update).length) throw new AppError('Provide at least one profile field to update.', 400);
  return update;
}
