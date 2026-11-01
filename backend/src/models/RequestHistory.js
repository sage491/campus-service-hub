import mongoose from 'mongoose';

const requestHistorySchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true, maxlength: 160 },
  fromStatus: { type: String, default: '' },
  toStatus: { type: String, default: '' },
  note: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

requestHistorySchema.index({ request: 1, createdAt: 1 });
export default mongoose.model('RequestHistory', requestHistorySchema);
