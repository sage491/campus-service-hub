import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  body: { type: String, required: true, trim: true, maxlength: 5000 },
  audience: { type: String, enum: ['all', 'student', 'faculty', 'admin'], default: 'all' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

noticeSchema.index({ isPublished: 1, publishedAt: -1 });
export default mongoose.model('Notice', noticeSchema);
