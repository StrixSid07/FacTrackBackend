const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;
