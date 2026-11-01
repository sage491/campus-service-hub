import mongoose from 'mongoose';
import ServiceRequest, { requestStatuses } from '../models/ServiceRequest.js';
import User from '../models/User.js';
import RequestHistory from '../models/RequestHistory.js';
import { createNotification } from '../services/notificationService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse } from '../utils/pagination.js';

const requestPopulate = [
  { path: 'student', select: 'name email studentId department' },
  { path: 'assignedTo', select: 'name email department' },
  { path: 'department', select: 'name code' },
  { path: 'resolutionNotes.author', select: 'name role' }
];

function validId(value, label) {
  if (!mongoose.isValidObjectId(value)) throw new AppError(`${label} is invalid.`, 400);
}

function validateNewRequest(body) {
  const fields = ['title', 'description', 'category', 'location'];
  for (const field of fields) if (!body[field]?.trim()) throw new AppError(`${field} is required.`, 400);
  if (!['Low', 'Medium', 'High'].includes(body.priority || 'Medium')) throw new AppError('Priority must be Low, Medium, or High.', 400);
  return { title: body.title.trim(), description: body.description.trim(), category: body.category.trim(), location: body.location.trim(), priority: body.priority || 'Medium' };
}

async function getRequestForUser(id, user) {
  validId(id, 'Request ID');
  const request = await ServiceRequest.findById(id).populate(requestPopulate);
  if (!request) throw new AppError('Service request not found.', 404);
  const isStudent = request.student._id.toString() === user._id.toString();
  const isFaculty = request.assignedTo?._id?.toString() === user._id.toString();
  if (user.role !== 'admin' && !isStudent && !isFaculty) throw new AppError('You do not have access to this request.', 403);
  return request;
}

async function recordHistory(details) { return RequestHistory.create(details); }

export const createRequest = asyncHandler(async (request, response) => {
  const details = validateNewRequest(request.body);
  const serviceRequest = await ServiceRequest.create({ ...details, student: request.user._id, department: request.user.department?._id || null });
  await recordHistory({ request: serviceRequest._id, actor: request.user._id, action: 'Request submitted', toStatus: 'Submitted' });
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(admins.map((admin) => createNotification({ recipient: admin._id, type: 'request', title: 'New service request', message: `${request.user.name} submitted “${serviceRequest.title}”.`, request: serviceRequest._id })));
  const populated = await ServiceRequest.findById(serviceRequest._id).populate(requestPopulate);
  response.status(201).json({ request: populated });
});

export const listRequests = asyncHandler(async (request, response) => {
  const filter = {};
  if (request.user.role === 'student') filter.student = request.user._id;
  if (request.user.role === 'faculty') filter.assignedTo = request.user._id;
  if (request.query.status && requestStatuses.includes(request.query.status)) filter.status = request.query.status;
  if (request.query.category) filter.category = new RegExp(`^${request.query.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (request.query.priority && ['Low', 'Medium', 'High'].includes(request.query.priority)) filter.priority = request.query.priority;
  if (request.query.q?.trim()) {
    const search = new RegExp(request.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: search }, { description: search }, { location: search }];
  }
  const { page, limit, skip } = getPagination(request.query);
  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter).populate(requestPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ServiceRequest.countDocuments(filter)
  ]);
  response.json({ requests, pagination: paginationResponse(page, limit, total) });
});

export const getRequest = asyncHandler(async (request, response) => {
  response.json({ request: await getRequestForUser(request.params.id, request.user) });
});

export const assignRequest = asyncHandler(async (request, response) => {
  validId(request.params.id, 'Request ID'); validId(request.body.facultyId, 'Faculty ID');
  const serviceRequest = await ServiceRequest.findById(request.params.id);
  if (!serviceRequest) throw new AppError('Service request not found.', 404);
  const faculty = await User.findOne({ _id: request.body.facultyId, role: 'faculty', isActive: true });
  if (!faculty) throw new AppError('Choose an active faculty account.', 400);
  const previousStatus = serviceRequest.status;
  serviceRequest.assignedTo = faculty._id;
  if (request.body.department) { validId(request.body.department, 'Department ID'); serviceRequest.department = request.body.department; }
  serviceRequest.status = 'Assigned';
  await serviceRequest.save();
  await recordHistory({ request: serviceRequest._id, actor: request.user._id, action: 'Request assigned', fromStatus: previousStatus, toStatus: 'Assigned', note: request.body.note?.trim() || '' });
  await Promise.all([
    createNotification({ recipient: faculty._id, type: 'request', title: 'Request assigned to you', message: `You were assigned “${serviceRequest.title}”.`, request: serviceRequest._id }),
    createNotification({ recipient: serviceRequest.student, type: 'request', title: 'Your request was assigned', message: `“${serviceRequest.title}” is now assigned to a campus team member.`, request: serviceRequest._id })
  ]);
  response.json({ request: await ServiceRequest.findById(serviceRequest._id).populate(requestPopulate) });
});

export const updateStatus = asyncHandler(async (request, response) => {
  const serviceRequest = await getRequestForUser(request.params.id, request.user);
  if (request.user.role === 'student') throw new AppError('Students cannot change request status.', 403);
  if (request.user.role === 'faculty' && serviceRequest.assignedTo?._id.toString() !== request.user._id.toString()) throw new AppError('This request is assigned to another faculty member.', 403);
  if (!requestStatuses.includes(request.body.status)) throw new AppError('Choose a valid request status.', 400);
  const previousStatus = serviceRequest.status;
  serviceRequest.status = request.body.status;
  await serviceRequest.save();
  await recordHistory({ request: serviceRequest._id, actor: request.user._id, action: 'Request status updated', fromStatus: previousStatus, toStatus: serviceRequest.status, note: request.body.note?.trim() || '' });
  await createNotification({ recipient: serviceRequest.student._id, type: 'request', title: 'Request status updated', message: `“${serviceRequest.title}” is now ${serviceRequest.status}.`, request: serviceRequest._id });
  response.json({ request: serviceRequest });
});

export const addResolutionNote = asyncHandler(async (request, response) => {
  const serviceRequest = await getRequestForUser(request.params.id, request.user);
  if (request.user.role === 'student') throw new AppError('Students cannot add resolution notes.', 403);
  if (request.user.role === 'faculty' && serviceRequest.assignedTo?._id.toString() !== request.user._id.toString()) throw new AppError('This request is assigned to another faculty member.', 403);
  const body = request.body.body?.trim();
  if (!body || body.length > 2000) throw new AppError('A resolution note of up to 2000 characters is required.', 400);
  serviceRequest.resolutionNotes.push({ author: request.user._id, body });
  await serviceRequest.save();
  await recordHistory({ request: serviceRequest._id, actor: request.user._id, action: 'Resolution note added', note: body });
  await createNotification({ recipient: serviceRequest.student._id, type: 'request', title: 'New note on your request', message: `A campus team member added a note to “${serviceRequest.title}”.`, request: serviceRequest._id });
  response.status(201).json({ request: serviceRequest });
});

export const getHistory = asyncHandler(async (request, response) => {
  const serviceRequest = await getRequestForUser(request.params.id, request.user);
  const history = await RequestHistory.find({ request: serviceRequest._id }).populate('actor', 'name role').sort({ createdAt: 1 });
  response.json({ history });
});
