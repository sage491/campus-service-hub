import Notice from '../models/Notice.js';
import User from '../models/User.js';
import { notifyUsers } from '../services/notificationService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse } from '../utils/pagination.js';

function validateNotice(body) {
  if (!body.title?.trim() || !body.body?.trim()) throw new AppError('Title and notice body are required.', 400);
  if (!['all', 'student', 'faculty', 'admin'].includes(body.audience || 'all')) throw new AppError('Choose a valid audience.', 400);
  return { title: body.title.trim(), body: body.body.trim(), audience: body.audience || 'all', department: body.department || null };
}

async function publishNotice(notice) {
  notice.isPublished = true;
  notice.publishedAt = new Date();
  await notice.save();
  const audience = { isActive: true };
  if (notice.audience !== 'all') audience.role = notice.audience;
  if (notice.department) audience.department = notice.department;
  const recipients = await User.find(audience).select('_id');
  await notifyUsers(recipients.map((user) => user._id), { type: 'notice', title: `New notice: ${notice.title}`, message: notice.body, notice: notice._id });
}

export const createNotice = asyncHandler(async (request, response) => {
  const details = validateNotice(request.body);
  const notice = await Notice.create({ ...details, author: request.user._id });
  if (request.body.publish === true) await publishNotice(notice);
  response.status(201).json({ notice: await notice.populate('author', 'name') });
});

export const publish = asyncHandler(async (request, response) => {
  const notice = await Notice.findById(request.params.id);
  if (!notice) throw new AppError('Notice not found.', 404);
  if (notice.isPublished) throw new AppError('This notice is already published.', 400);
  await publishNotice(notice);
  response.json({ notice: await notice.populate('author', 'name') });
});

export const listNotices = asyncHandler(async (request, response) => {
  const filter = request.user.role === 'admin' && request.query.includeDrafts === 'true'
    ? {}
    : { isPublished: true, audience: { $in: ['all', request.user.role] }, $or: [{ department: null }, { department: request.user.department?._id || null }] };
  const { page, limit, skip } = getPagination(request.query);
  const [notices, total] = await Promise.all([
    Notice.find(filter).populate('author', 'name').populate('department', 'name code').sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    Notice.countDocuments(filter)
  ]);
  response.json({ notices, pagination: paginationResponse(page, limit, total) });
});

export const removeNotice = asyncHandler(async (request, response) => {
  const notice = await Notice.findByIdAndDelete(request.params.id);
  if (!notice) throw new AppError('Notice not found.', 404);
  response.status(204).send();
});
