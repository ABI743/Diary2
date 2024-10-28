const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const EntrySchema = new mongoose.Schema({
  name: String,
  message: String,
  signature: String,
  date: String
});

const Entry = mongoose.model('Entry', EntrySchema);

app.post('/api/verify-password', async (req, res) => {
  const { password, type } = req.body;
  const correctPassword = type === 'write' ? process.env.WRITE_PASSWORD : process.env.READ_PASSWORD;
  
  const isCorrect = password === correctPassword;
  res.json({ isCorrect });
});

app.post('/api/entries', async (req, res) => {
  const { password, entry } = req.body;
  
  if (password === process.env.WRITE_PASSWORD) {
    const newEntry = new Entry(entry);
    await newEntry.save();
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.post('/api/read-entries', async (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.READ_PASSWORD) {
    const entries = await Entry.find();
    res.json(entries);
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
