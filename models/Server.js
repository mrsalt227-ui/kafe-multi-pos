const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, default: '' },
  icon: { type: String, default: '☕' },
  id: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  settings: {
    stok_mode: { type: String, enum: ['fifo', 'atomic'], default: 'fifo' }
  }
});

module.exports = mongoose.model('Server', serverSchema);
