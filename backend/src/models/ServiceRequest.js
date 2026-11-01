import mongoose from 'mongoose';

export const requestStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Reopened'];
const resolutionNoteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const serviceRequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  status: { type: String, enum: requestStatuses, default: 'Submitted' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
  resolutionNotes: { type: [resolutionNoteSchema], default: [] }
}, { timestamps: true });

serviceRequestSchema.index({ status: 1, createdAt: -1 });
serviceRequestSchema.index({ category: 1, priority: 1 });
export default mongoose.model('ServiceRequest', serviceRequestSchema);
