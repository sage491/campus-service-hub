import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 12 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
