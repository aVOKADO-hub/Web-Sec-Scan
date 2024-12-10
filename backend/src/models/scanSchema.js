import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  scanId: { type: String, required: true },
  scanType: { type: String, default: 'all' },
  status: { type: String, default: 'Started' },
  alert: { type: String },
  risk: { type: String },
  description: { type: String }, // Додано поле
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { versionKey: false });


const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
