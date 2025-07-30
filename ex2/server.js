const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/authDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send('User already exists!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role });

  try {
    await user.save();
    res.send('User registered successfully!');
  } catch (err) {
    res.status(500).send('Error saving user.');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ username, email });
  if (!user) {
    return res.status(400).json({ message: 'User not found. Register first.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  res.json({ message: 'Login successful', role: user.role });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
