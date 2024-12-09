import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  scanId: { type: String, required: true },
  scanType: { type: String, default: 'all' },
  status: { type: String, default: 'Started' }, // Статус сканирования (например, Started, Completed, Failed)
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
