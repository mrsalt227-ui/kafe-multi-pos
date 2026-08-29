const express = require('express');
const router = express.Router();
const Laporan = require('../models/Laporan');
const auth = require('../middleware/auth');

// Get laporan untuk server
router.get('/:serverId', async (req, res) => {
  try {
    const laporans = await Laporan.find({ serverId: req.params.serverId })
      .sort({ ts: -1 });
    
    const result = {};
    laporans.forEach(l => {
      result[l._id.toString()] = {
        meja: l.meja,
        items: l.items,
        total: l.total,
        cash: l.cash,
        change: l.change,
        tgl: l.tgl,
        ts: l.ts
      };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simpan laporan dari pembayaran
router.post('/:serverId', auth, async (req, res) => {
  try {
    const { meja, items, total, cash, change, tgl } = req.body;
    const laporan = new Laporan({
      serverId: req.params.serverId,
      meja,
      items,
      total,
      cash,
      change,
      tgl
    });
    await laporan.save();
    res.status(201).json(laporan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset laporan
router.delete('/:serverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev' });
    }
    await Laporan.deleteMany({ serverId: req.params.serverId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
