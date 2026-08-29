const mongoose = require('mongoose');

const laporanSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  meja: { type: Number, required: true },
  items: [{
    n: String,
    h: Number,
    qty: Number
  }],
  total: { type: Number, required: true },
  cash: { type: Number, required: true },
  change: { type: Number, required: true },
  tgl: { type: String, required: true },
  ts: { type: Date, default: Date.now }
});

laporanSchema.index({ serverId: 1, ts: -1 });

module.exports = mongoose.model('Laporan', laporanSchema);
