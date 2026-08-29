const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Stok = require('../models/Stok');
const auth = require('../middleware/auth');

// Get orders untuk server
router.get('/:serverId', async (req, res) => {
  try {
    const orders = await Order.find({ serverId: req.params.serverId })
      .sort({ ts: 1 });
    
    const result = {};
    orders.forEach(o => {
      result[o._id.toString()] = {
        meja: o.meja,
        items: o.items,
        status: o.status,
        ts: o.ts,
        total: o.total,
        sudah_bayar: o.sudah_bayar,
        metode_bayar: o.metode_bayar
      };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buat pesanan baru (waiter)
router.post('/:serverId/create', auth, async (req, res) => {
  try {
    const { meja, items } = req.body;
    const { serverId } = req.params;

    // Cek stok tersedia
    for (const item of items) {
      const stoks = await Stok.find({ serverId, menuId: item.id });
      const totalStok = stoks.reduce((a, b) => a + b.qty, 0);
      if (totalStok < item.qty) {
        return res.status(400).json({ error: `Stok "${item.n}" tidak cukup` });
      }
    }

    // Kurangi stok FIFO
    for (const item of items) {
      const stoks = await Stok.find({ serverId, menuId: item.id }).sort({ ts: 1 });
      let needed = item.qty;

      for (const stok of stoks) {
        if (needed <= 0) break;
        if (stok.qty <= needed) {
          await Stok.findByIdAndDelete(stok._id);
          needed -= stok.qty;
        } else {
          await Stok.findByIdAndUpdate(stok._id, { qty: stok.qty - needed });
          needed = 0;
        }
      }
    }

    // Buat pesanan
    const total = items.reduce((a, b) => a + (b.h * b.qty), 0);
    const order = new Order({
      serverId,
      meja,
      items,
      status: 'masak',
      total,
      ts: new Date()
    });
    await order.save();

    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status pesanan
router.put('/:serverId/:orderId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pembayaran
router.post('/:serverId/:orderId/pay', auth, async (req, res) => {
  try {
    const { cash, change } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'selesai', sudah_bayar: true, cash, change },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete pesanan (dev reset)
router.delete('/:serverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya dev' });
    }
    await Order.deleteMany({ serverId: req.params.serverId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
