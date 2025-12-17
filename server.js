require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const Password = require('./models/Password');
const File = require('./models/File');

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ===================== AWS S3 ===================== */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/* ===================== MULTER ===================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

/* ===================== DB CONNECT ===================== */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;

  console.log('MongoDB connected');

  // Initialize password ONCE
  const exists = await Password.findOne();
  if (!exists) {
    const hashed = await bcrypt.hash(process.env.DEFAULT_PASSWORD || '1234', 10);
    await Password.create({ password: hashed });
    console.log('Default password created');
  }
}
connectDB();

/* ===================== AUTH ===================== */
app.post('/api/auth/verify', async (req, res) => {
  try {
    await connectDB();

    const { password } = req.body;
    if (!/^\d{4}$/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be 4 digits' });
    }

    const stored = await Password.findOne();
    if (!stored) {
      return res.status(500).json({ success: false, message: 'Password not configured' });
    }

    const match = await bcrypt.compare(password, stored.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    await connectDB();

    const { currentPassword, newPassword } = req.body;

    if (!/^\d{4}$/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be 4 digits' });
    }

    const stored = await Password.findOne();
    const ok = await bcrypt.compare(currentPassword, stored.password);
    if (!ok) {
      return res.status(401).json({ message: 'Current password incorrect' });
    }

    stored.password = await bcrypt.hash(newPassword, 10);
    await stored.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ===================== FILE UPLOAD ===================== */
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    await connectDB();

    if (!req.file) return res.status(400).json({ message: 'No file' });

    const key = `uploads/${uuidv4()}${path.extname(req.file.originalname)}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const file = await File.create({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      s3Key: key,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    res.json({ success: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===================== FILE LIST ===================== */
app.get('/api/files', async (req, res) => {
  await connectDB();
  const files = await File.find().sort({ uploadedAt: -1 });
  res.json({ success: true, files });
});

/* ===================== DOWNLOAD ===================== */
app.get('/api/files/download/:id', async (req, res) => {
  await connectDB();
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`
    }),
    { expiresIn: 3600 }
  );

  res.json({ success: true, url });
});

/* ===================== DELETE ===================== */
app.delete('/api/files/:id', async (req, res) => {
  await connectDB();

  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });

  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.s3Key
  }));

  await file.deleteOne();
  res.json({ success: true });
});

/* ===================== FRONTEND ===================== */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ===================== EXPORT FOR VERCEL ===================== */
module.exports = app;
