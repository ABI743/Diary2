const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

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
  const correctHash = type === 'write' ? process.env.WRITE_PASSWORD_HASH : process.env.READ_PASSWORD_HASH;
  
  const isCorrect = await bcrypt.compare(password, correctHash);
  res.json({ isCorrect });
});

app.post('/api/entries', async (req, res) => {
  const { password } = req.body;
  const isCorrect = await bcrypt.compare(password, process.env.WRITE_PASSWORD_HASH);
  
  if (isCorrect) {
    const newEntry = new Entry(req.body.entry);
    await newEntry.save();
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.post('/api/read-entries', async (req, res) => {
  const { password } = req.body;
  const isCorrect = await bcrypt.compare(password, process.env.READ_PASSWORD_HASH);
  
  if (isCorrect) {
    const entries = await Entry.find();
    res.json(entries);
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
