import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import ServiceRequest from '../models/ServiceRequest.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse } from '../utils/pagination.js';

export const submitFeedback = asyncHandler(async (request, response) => {
  const rating = Number(request.body.rating);
  const message = request.body.message?.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !message || message.length > 2000) throw new AppError('Provide a rating from 1 to 5 and feedback of up to 2000 characters.', 400);
  if (request.body.request) {
    if (!mongoose.isValidObjectId(request.body.request)) throw new AppError('Request ID is invalid.', 400);
    const ownedRequest = await ServiceRequest.exists({ _id: request.body.request, student: request.user._id });
    if (!ownedRequest) throw new AppError('You can only give feedback about your own requests.', 403);
  }
  const feedback = await Feedback.create({ student: request.user._id, request: request.body.request || null, rating, message });
  response.status(201).json({ feedback });
});

export const listFeedback = asyncHandler(async (request, response) => {
  const filter = {};
  if (request.query.rating) filter.rating = Number(request.query.rating);
  const { page, limit, skip } = getPagination(request.query);
  const [feedback, total] = await Promise.all([
    Feedback.find(filter).populate('student', 'name email studentId').populate('request', 'title status').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(filter)
  ]);
  response.json({ feedback, pagination: paginationResponse(page, limit, total) });
});
