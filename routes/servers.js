const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const OtpPin = require('../models/OtpPin');
const auth = require('../middleware/auth');
const { nanoid } = require('nanoid');
const crypto = require('crypto');

const randPin6 = (exclude = []) => {
  const avoid = new Set([process.env.DEV_PIN || '181920', ...exclude]);
  let p;
  do {
    p = String(Math.floor(100000 + Math.random() * 900000));
  } while (avoid.has(p));
  return p;
};

// Get all servers
router.get('/', async (req, res) => {
  try {
    const servers = await Server.find().select('name desc icon id createdAt');
    const result = {};
    servers.forEach(s => {
      result[s.id] = { name: s.name, desc: s.desc, icon: s.icon, createdAt: s.createdAt };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new server
router.post('/', async (req, res) => {
  try {
    const { name, desc, icon, id } = req.body;

    // Validasi ID unik
    const existing = await Server.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: 'ID sudah dipakai' });
    }

    // Buat server baru
    const server = new Server({
      name,
      desc,
      icon,
      id,
      settings: { stok_mode: 'fifo' }
    });
    await server.save();

    // Generate PIN Owner untuk server baru
    const ownerPin = randPin6();
    await OtpPin.create({
      serverId: server._id,
      role: 'owner',
      pin: ownerPin,
      status: 'active',
      createdBy: 'dev'
    });

    res.status(201).json({ serverId: server._id, id: server.id, ownerPin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update server ID (ganti ID kafe)
router.put('/:serverId/change-id', auth, async (req, res) => {
  try {
    const { newId } = req.body;
    const { serverId } = req.params;

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ error: 'Server tidak ditemukan' });

    // Cek ID baru sudah dipakai
    const existing = await Server.findOne({ id: newId });
    if (existing) {
      return res.status(400).json({ error: 'ID sudah dipakai kafe lain' });
    }

    server.id = newId;
    await server.save();

    res.json({ success: true, newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete server (dev only)
router.delete('/:serverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya dev yang bisa hapus server' });
    }

    await Server.findByIdAndDelete(req.params.serverId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update server settings
router.put('/:serverId/settings', auth, async (req, res) => {
  try {
    const { stok_mode } = req.body;
    const server = await Server.findByIdAndUpdate(
      req.params.serverId,
      { 'settings.stok_mode': stok_mode },
      { new: true }
    );
    res.json(server);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
