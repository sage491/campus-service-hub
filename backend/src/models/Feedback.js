import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
