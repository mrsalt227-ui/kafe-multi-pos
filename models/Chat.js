const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  channel: { type: String, default: 'umum' },
  ts: { type: Date, default: Date.now },
  type: { type: String, default: 'message', enum: ['message', 'system'] }
});

chatSchema.index({ serverId: 1, channel: 1, ts: -1 });

module.exports = mongoose.model('Chat', chatSchema);
