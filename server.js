require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const Password = require('./models/Password');
const File = require('./models/File');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Multer configuration for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Initialize default password if not exists
        const existingPassword = await Password.findOne();
        if (!existingPassword) {
            await Password.create({ password: process.env.DEFAULT_PASSWORD || '1234' });
            console.log('Default password initialized');
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// ==================== AUTH ROUTES ====================

// Verify password
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length !== 4) {
            return res.status(400).json({ success: false, message: 'Invalid password format' });
        }

        const storedPassword = await Password.findOne();
        if (!storedPassword) {
            return res.status(500).json({ success: false, message: 'Password not configured' });
        }

        if (storedPassword.password === password) {
            return res.json({ success: true, message: 'Authentication successful' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords required' });
        }

        if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'New password must be 4 digits' });
        }

        const storedPassword = await Password.findOne();
        if (!storedPassword || storedPassword.password !== currentPassword) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        storedPassword.password = newPassword;
        await storedPassword.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==================== FILE ROUTES ====================

// Upload file
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileExtension = path.extname(req.file.originalname);
        const s3Key = `uploads/${uuidv4()}${fileExtension}`;

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Save file metadata to MongoDB
        const file = await File.create({
            filename: req.file.originalname,
            originalName: req.file.originalname,
            s3Key: s3Key,
            size: req.file.size,
            mimeType: req.file.mimetype
        });

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                id: file._id,
                filename: file.filename,
                size: file.size,
                mimeType: file.mimeType,
                uploadedAt: file.uploadedAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

// List all files
app.get('/api/files', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadedAt: -1 });
        res.json({
            success: true,
            files: files.map(file => ({
                id: file._id,
                filename: file.filename,
                size: file.size,
                mimeType: file.mimeType,
                uploadedAt: file.uploadedAt
            }))
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ success: false, message: 'Failed to list files' });
    }
});

// Get download URL (signed URL for secure download)
app.get('/api/files/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.s3Key,
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.originalName)}"`
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({
            success: true,
            url: signedUrl,
            filename: file.originalName
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate download link' });
    }
});

// Get preview URL (for viewing files inline)
app.get('/api/files/preview/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.s3Key
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({
            success: true,
            url: signedUrl,
            filename: file.originalName,
            mimeType: file.mimeType
        });
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate preview link' });
    }
});

// Rename file
app.put('/api/files/:id/rename', async (req, res) => {
    try {
        const { newName } = req.body;
        if (!newName || !newName.trim()) {
            return res.status(400).json({ success: false, message: 'New name is required' });
        }

        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        file.filename = newName.trim();
        file.originalName = newName.trim();
        await file.save();

        res.json({ success: true, message: 'File renamed successfully' });
    } catch (error) {
        console.error('Rename error:', error);
        res.status(500).json({ success: false, message: 'Failed to rename file' });
    }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Delete from S3
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.s3Key
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));

        // Delete from MongoDB
        await File.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete file' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
