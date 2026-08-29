const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// Get menu untuk server
router.get('/:serverId', async (req, res) => {
  try {
    const menus = await Menu.find({ serverId: req.params.serverId });
    const result = {};
    menus.forEach(m => {
      result[m._id.toString()] = { n: m.n, h: m.h };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create menu (owner/dev)
router.post('/:serverId', auth, async (req, res) => {
  try {
    const { n, h } = req.body;
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev yang bisa tambah menu' });
    }

    const menu = new Menu({ serverId: req.params.serverId, n, h });
    await menu.save();
    res.status(201).json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete menu
router.delete('/:serverId/:menuId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev yang bisa hapus menu' });
    }

    await Menu.findByIdAndDelete(req.params.menuId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
