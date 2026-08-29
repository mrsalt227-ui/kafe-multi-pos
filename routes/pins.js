const express = require('express');
const router = express.Router();
const OtpPin = require('../models/OtpPin');
const CreateServerPin = require('../models/CreateServerPin');
const auth = require('../middleware/auth');

const randPin6 = (exclude = []) => {
  const avoid = new Set([process.env.DEV_PIN || '181920', ...exclude]);
  let p;
  do {
    p = String(Math.floor(100000 + Math.random() * 900000));
  } while (avoid.has(p));
  return p;
};

// Get PIN untuk server (staff roles)
router.get('/:serverId', async (req, res) => {
  try {
    const pins = await OtpPin.find({ serverId: req.params.serverId });
    const result = {};
    pins.forEach(p => {
      result[p._id.toString()] = {
        role: p.role,
        pin: p.pin,
        status: p.status
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PIN untuk role (owner)
router.post('/:serverId/generate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev' });
    }

    const { role } = req.body;
    
    // Hapus PIN aktif lama untuk role ini
    await OtpPin.deleteMany({
      serverId: req.params.serverId,
      role,
      status: 'active'
    });

    const pin = randPin6();
    const newPin = new OtpPin({
      serverId: req.params.serverId,
      role,
      pin,
      status: 'active',
      createdBy: req.user.role
    });
    await newPin.save();

    res.json({ pin, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke PIN
router.delete('/:serverId/:pinId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev' });
    }
    await OtpPin.findByIdAndDelete(req.params.pinId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PIN Buat Server Baru (global, bukan per-server)
router.post('/global/generate-create-server-pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya dev' });
    }

    // Hapus PIN aktif lama
    await CreateServerPin.deleteMany({ status: 'active' });

    const pin = randPin6();
    const newPin = new CreateServerPin({ pin, status: 'active' });
    await newPin.save();

    res.json({ pin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke Global Create Server PIN
router.delete('/global/revoke-create-server-pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya dev' });
    }
    await CreateServerPin.deleteMany({ status: 'active' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
