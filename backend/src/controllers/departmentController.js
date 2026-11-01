import Department from '../models/Department.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listDepartments = asyncHandler(async (_request, response) => {
  response.json({ departments: await Department.find({ isActive: true }).sort({ name: 1 }) });
});

export const createDepartment = asyncHandler(async (request, response) => {
  const { name, code, description = '' } = request.body;
  if (!name?.trim() || !code?.trim()) throw new AppError('Department name and code are required.', 400);
  const department = await Department.create({ name: name.trim(), code: code.trim(), description: description.trim() });
  response.status(201).json({ department });
});

export const updateDepartment = asyncHandler(async (request, response) => {
  const update = {};
  for (const key of ['name', 'code', 'description', 'isActive']) if (request.body[key] !== undefined) update[key] = typeof request.body[key] === 'string' ? request.body[key].trim() : request.body[key];
  if (!Object.keys(update).length) throw new AppError('Provide a department field to update.', 400);
  const department = await Department.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true });
  if (!department) throw new AppError('Department not found.', 404);
  response.json({ department });
});
