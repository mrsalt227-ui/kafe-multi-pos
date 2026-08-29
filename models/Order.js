const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  meja: { type: Number, required: true },
  items: [{
    id: mongoose.Schema.Types.ObjectId,
    n: String,
    h: Number,
    qty: Number
  }],
  status: { type: String, enum: ['masak', 'antar', 'kasir', 'selesai'], default: 'masak' },
  total: { type: Number, required: true },
  ts: { type: Date, default: Date.now },
  sudah_bayar: { type: Boolean, default: false },
  metode_bayar: { type: String, default: '' },
  cash: { type: Number, default: 0 },
  change: { type: Number, default: 0 }
});

orderSchema.index({ serverId: 1, status: 1, ts: -1 });

module.exports = mongoose.model('Order', orderSchema);
