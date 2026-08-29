const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get chat messages
router.get('/:serverId', async (req, res) => {
  try {
    const chats = await Chat.find({ serverId: req.params.serverId })
      .sort({ ts: 1 })
      .limit(200);
    
    const result = {};
    chats.forEach(c => {
      result[c._id.toString()] = {
        role: c.role,
        text: c.text,
        channel: c.channel,
        ts: c.ts,
        type: c.type
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send chat message
router.post('/:serverId/send', auth, async (req, res) => {
  try {
    const { text, channel } = req.body;
    const chat = new Chat({
      serverId: req.params.serverId,
      role: req.user.role,
      text,
      channel: channel || 'umum',
      ts: new Date()
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all chat
router.delete('/:serverId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Hanya owner/dev' });
    }
    await Chat.deleteMany({ serverId: req.params.serverId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
