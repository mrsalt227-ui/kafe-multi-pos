const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  n: { type: String, required: true }, // nama menu
  h: { type: Number, required: true }, // harga
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Menu', menuSchema);
