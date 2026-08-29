const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const OtpPin = require('../models/OtpPin');
const Server = require('../models/Server');
const CreateServerPin = require('../models/CreateServerPin');

const DEV_PIN = process.env.DEV_PIN || '181920';

// Login dengan PIN (staff/owner)
router.post('/login', async (req, res) => {
  try {
    const { serverId, pin } = req.body;

    // Cari OTP PIN di server yang dipilih
    const otpRecord = await OtpPin.findOne({
      serverId,
      pin,
      status: 'active'
    });

    if (!otpRecord) {
      return res.status(401).json({ error: 'PIN salah atau sudah kadaluarsa' });
    }

    // Tandai PIN sebagai sudah digunakan (sekali pakai)
    await OtpPin.updateOne(
      { _id: otpRecord._id },
      { status: 'used', usedAt: new Date() }
    );

    // Generate JWT token
    const token = jwt.sign(
      { serverId, role: otpRecord.role, pinId: otpRecord._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, role: otpRecord.role, serverId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Developer
router.post('/dev-login', (req, res) => {
  const { code } = req.body;

  if (code !== DEV_PIN) {
    return res.status(401).json({ error: 'Kode developer salah' });
  }

  const token = jwt.sign(
    { role: 'dev', isDev: true },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  res.json({ token, role: 'dev' });
});

// Validasi PIN Buat Server Baru (generate dari dev)
router.post('/validate-create-server-pin', async (req, res) => {
  try {
    const { pin } = req.body;

    const record = await CreateServerPin.findOne({ pin, status: 'active' });
    if (!record) {
      return res.status(401).json({ error: 'PIN salah atau sudah dipakai' });
    }

    // Konsumsi PIN (sekali pakai)
    await CreateServerPin.updateOne(
      { _id: record._id },
      { status: 'used', usedAt: new Date() }
    );

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
