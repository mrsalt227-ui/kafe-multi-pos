const mongoose = require('mongoose');

const stokSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  qty: { type: Number, required: true, min: 0 },
  ts: { type: Date, default: Date.now },
  batch: { type: String, default: '' }
});

stokSchema.index({ serverId: 1, menuId: 1, ts: 1 });

module.exports = mongoose.model('Stok', stokSchema);
