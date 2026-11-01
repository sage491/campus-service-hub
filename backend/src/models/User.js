import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  studentId: { type: String, trim: true, maxlength: 40, default: '' },
  isActive: { type: Boolean, default: true },
  sessionVersion: { type: Number, default: 0, select: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
