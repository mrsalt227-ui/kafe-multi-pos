const express = require('express');
const router = express.Router();
const Stok = require('../models/Stok');
const auth = require('../middleware/auth');
const Server = require('../models/Server');

// Get stok FIFO untuk server
router.get('/:serverId', async (req, res) => {
  try {
    const stoks = await Stok.find({ serverId: req.params.serverId })
      .sort({ menuId: 1, ts: 1 });
    
    const result = {};
    stoks.forEach(s => {
      const menuId = s.menuId.toString();
      if (!result[menuId]) result[menuId] = {};
      result[menuId][s._id.toString()] = { qty: s.qty, ts: s.ts };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah stok batch
router.post('/:serverId/add', auth, async (req, res) => {
  try {
    const { menuId, qty } = req.body;
    
    const stok = new Stok({
      serverId: req.params.serverId,
      menuId,
      qty,
      ts: new Date()
    });
    await stok.save();
    res.status(201).json(stok);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kurangi stok FIFO
router.post('/:serverId/deduct', auth, async (req, res) => {
  try {
    const { menuId, qty } = req.body;
    const { serverId } = req.params;

    // Ambil stok terurut FIFO (paling lama duluan)
    const stoks = await Stok.find({ serverId, menuId })
      .sort({ ts: 1 });

    let needed = qty;
    const updates = [];

    for (const stok of stoks) {
      if (needed <= 0) break;
      
      if (stok.qty <= needed) {
        // Hapus batch ini
        updates.push(Stok.findByIdAndDelete(stok._id));
        needed -= stok.qty;
      } else {
        // Kurangi qty batch ini
        updates.push(Stok.findByIdAndUpdate(stok._id, { qty: stok.qty - needed }));
        needed = 0;
      }
    }

    if (needed > 0) {
      return res.status(400).json({ error: 'Stok tidak cukup' });
    }

    await Promise.all(updates);
    res.json({ success: true, deducted: qty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset stok
router.delete('/:serverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev' });
    }

    await Stok.deleteMany({ serverId: req.params.serverId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
