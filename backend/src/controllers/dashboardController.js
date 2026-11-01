import Feedback from '../models/Feedback.js';
import Notice from '../models/Notice.js';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (request, response) => {
  const scope = request.user.role === 'student' ? { student: request.user._id } : request.user.role === 'faculty' ? { assignedTo: request.user._id } : {};
  const [totalRequests, submitted, active, resolved, unreadNotifications, requestsByStatus, requestsByCategory] = await Promise.all([
    ServiceRequest.countDocuments(scope),
    ServiceRequest.countDocuments({ ...scope, status: { $in: ['Submitted', 'Under Review', 'Assigned'] } }),
    ServiceRequest.countDocuments({ ...scope, status: 'In Progress' }),
    ServiceRequest.countDocuments({ ...scope, status: 'Resolved' }),
    Notification.countDocuments({ recipient: request.user._id, readAt: null }),
    ServiceRequest.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ServiceRequest.aggregate([{ $match: scope }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);
  const responseData = { metrics: { totalRequests, submitted, active, resolved, unreadNotifications }, requestsByStatus, requestsByCategory };
  if (request.user.role === 'admin') {
    const [users, faculty, feedback, notices] = await Promise.all([User.countDocuments(), User.countDocuments({ role: 'faculty', isActive: true }), Feedback.countDocuments(), Notice.countDocuments({ isPublished: true })]);
    responseData.adminMetrics = { users, faculty, feedback, notices };
  }
  if (request.user.role === 'faculty' && request.user.department?._id) {
    const departmentScope = { department: request.user.department._id };
    const [departmentRequests, departmentResolved] = await Promise.all([ServiceRequest.countDocuments(departmentScope), ServiceRequest.countDocuments({ ...departmentScope, status: 'Resolved' })]);
    responseData.departmentMetrics = { departmentRequests, departmentResolved, departmentName: request.user.department.name };
  }
  response.json(responseData);
});
