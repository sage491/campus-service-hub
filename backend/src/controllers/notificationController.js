import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse } from '../utils/pagination.js';

export const listNotifications = asyncHandler(async (request, response) => {
  const filter = { recipient: request.user._id };
  if (request.query.unread === 'true') filter.readAt = null;
  const { page, limit, skip } = getPagination(request.query);
  const [notifications, total] = await Promise.all([
    Notification.find(filter).populate('request', 'title status').populate('notice', 'title').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter)
  ]);
  response.json({ notifications, pagination: paginationResponse(page, limit, total) });
});

export const markRead = asyncHandler(async (request, response) => {
  const notification = await Notification.findOneAndUpdate({ _id: request.params.id, recipient: request.user._id }, { readAt: new Date() }, { new: true });
  if (!notification) throw new AppError('Notification not found.', 404);
  response.json({ notification });
});

export const markAllRead = asyncHandler(async (request, response) => {
  await Notification.updateMany({ recipient: request.user._id, readAt: null }, { readAt: new Date() });
  response.status(204).send();
});
