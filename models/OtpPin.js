const mongoose = require('mongoose');

const otpPinSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  role: { type: String, enum: ['owner', 'waiter', 'dapur', 'kasir'], required: true },
  pin: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'used'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date, default: null },
  createdBy: { type: String, default: 'owner' }
});

otpPinSchema.index({ serverId: 1, status: 1 });

module.exports = mongoose.model('OtpPin', otpPinSchema);
