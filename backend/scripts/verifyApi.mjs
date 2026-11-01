import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('campus-service-hub-test');
process.env.JWT_SECRET = 'integration-test-secret-that-is-long-enough';
process.env.CLIENT_URL = 'http://localhost:5173';

const [{ default: app }, { connectDatabase }, { default: User }, { hashPassword }, mongoose] = await Promise.all([
  import('../src/app.js'),
  import('../src/config/database.js'),
  import('../src/models/User.js'),
  import('../src/services/authService.js'),
  import('mongoose')
]);

let server;

async function request(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

try {
  await connectDatabase();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const admin = await User.create({ name: 'Campus Admin', email: 'admin@campus.test', password: await hashPassword('AdminPass123'), role: 'admin' });
  const adminLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: admin.email, password: 'AdminPass123' }) });
  assert.equal(adminLogin.status, 200);
  const invalidLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: admin.email, password: 'WrongPass123' }) });
  assert.equal(invalidLogin.status, 401);
  const missingLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: admin.email }) });
  assert.equal(missingLogin.status, 400);

  const department = await request('/departments', { method: 'POST', headers: auth(adminLogin.body.token), body: JSON.stringify({ name: 'Information Technology', code: 'IT' }) });
  assert.equal(department.status, 201);

  const faculty = await request('/users', { method: 'POST', headers: auth(adminLogin.body.token), body: JSON.stringify({ name: 'Faculty One', email: 'faculty@campus.test', password: 'FacultyPass123', role: 'faculty', department: department.body.department._id }) });
  assert.equal(faculty.status, 201);
  const facultyLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'faculty@campus.test', password: 'FacultyPass123' }) });
  assert.equal(facultyLogin.status, 200);
  const adminDashboard = await request('/dashboard', { headers: auth(adminLogin.body.token) });
  assert.equal(adminDashboard.status, 200);
  assert.equal(adminDashboard.body.adminMetrics.faculty, 1);

  const student = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Student One', email: 'student@campus.test', password: 'StudentPass123', role: 'admin' }) });
  assert.equal(student.status, 201);
  assert.equal(student.body.user.role, 'student');
  const otherStudent = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Student Two', email: 'student2@campus.test', password: 'StudentPass123' }) });
  assert.equal(otherStudent.status, 201);

  const createdRequest = await request('/requests', { method: 'POST', headers: auth(student.body.token), body: JSON.stringify({ title: 'Projector is not working', description: 'No display appears in room 204.', category: 'IT support', location: 'Block A, Room 204', priority: 'High' }) });
  assert.equal(createdRequest.status, 201);
  const requestId = createdRequest.body.request._id;

  const otherRequests = await request('/requests', { headers: auth(otherStudent.body.token) });
  assert.equal(otherRequests.status, 200);
  assert.equal(otherRequests.body.requests.length, 0);

  const assigned = await request(`/requests/${requestId}/assign`, { method: 'PATCH', headers: auth(adminLogin.body.token), body: JSON.stringify({ facultyId: faculty.body.user.id, department: department.body.department._id }) });
  assert.equal(assigned.status, 200);
  assert.equal(assigned.body.request.status, 'Assigned');

  const facultyRequests = await request('/requests?status=Assigned', { headers: auth(facultyLogin.body.token) });
  assert.equal(facultyRequests.status, 200);
  assert.equal(facultyRequests.body.requests.length, 1);
  const facultyDashboard = await request('/dashboard', { headers: auth(facultyLogin.body.token) });
  assert.equal(facultyDashboard.status, 200);
  assert.equal(facultyDashboard.body.departmentMetrics.departmentRequests, 1);

  const progressed = await request(`/requests/${requestId}/status`, { method: 'PATCH', headers: auth(facultyLogin.body.token), body: JSON.stringify({ status: 'In Progress' }) });
  assert.equal(progressed.status, 200);
  const note = await request(`/requests/${requestId}/resolution-notes`, { method: 'POST', headers: auth(facultyLogin.body.token), body: JSON.stringify({ body: 'Replacement cable ordered.' }) });
  assert.equal(note.status, 201);
  const history = await request(`/requests/${requestId}/history`, { headers: auth(student.body.token) });
  assert.equal(history.status, 200);
  assert.ok(history.body.history.length >= 3);

  const notice = await request('/notices', { method: 'POST', headers: auth(adminLogin.body.token), body: JSON.stringify({ title: 'Library hours', body: 'The library will remain open until 8 PM.', audience: 'student', publish: true }) });
  assert.equal(notice.status, 201);
  const notices = await request('/notices', { headers: auth(student.body.token) });
  assert.equal(notices.status, 200);
  assert.equal(notices.body.notices.length, 1);

  const feedback = await request('/feedback', { method: 'POST', headers: auth(student.body.token), body: JSON.stringify({ request: requestId, rating: 5, message: 'The response was quick and helpful.' }) });
  assert.equal(feedback.status, 201);
  const allFeedback = await request('/feedback', { headers: auth(adminLogin.body.token) });
  assert.equal(allFeedback.status, 200);
  assert.equal(allFeedback.body.feedback.length, 1);

  const notifications = await request('/notifications?unread=true', { headers: auth(student.body.token) });
  assert.equal(notifications.status, 200);
  assert.ok(notifications.body.notifications.length >= 3);
  const logout = await request('/auth/logout', { method: 'POST', headers: auth(student.body.token) });
  assert.equal(logout.status, 204);
  const expiredSession = await request('/auth/me', { headers: auth(student.body.token) });
  assert.equal(expiredSession.status, 401);

  console.log('API integration verification passed.');
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.default.disconnect();
  await mongo.stop();
}
