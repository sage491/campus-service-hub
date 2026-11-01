import Notification from '../models/Notification.js';

export async function createNotification(details) {
  return Notification.create(details);
}

export async function notifyUsers(recipients, details) {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean).map((id) => id.toString()))];
  if (!uniqueRecipients.length) return [];
  return Notification.insertMany(uniqueRecipients.map((recipient) => ({ ...details, recipient })));
}
