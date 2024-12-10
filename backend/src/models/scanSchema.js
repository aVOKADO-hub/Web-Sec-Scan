import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  alert: String,
  risk: String,
  description: String,
  url: String,
  solution: String,
}, {versionKey:false});

const scanSchema = new mongoose.Schema({
  targetUrl: String,
  scanId: String,
  scanType: String,
  status: String,
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  alerts: [alertSchema], 
}, {versionKey:false});

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
