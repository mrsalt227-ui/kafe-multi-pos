const mongoose = require('mongoose');

const createServerPinSchema = new mongoose.Schema({
  pin: { type: String, unique: true, required: true },
  status: { type: String, enum: ['active', 'used'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date, default: null }
});

module.exports = mongoose.model('CreateServerPin', createServerPinSchema);
