const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const connectDB = require('../_lib/db');
const File = require('../_lib/models/File');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectDB();

        // Parse multipart form data
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Simple multipart parser for single file
        const boundary = req.headers['content-type'].split('boundary=')[1];
        if (!boundary) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const parts = buffer.toString('binary').split('--' + boundary);
        let fileData = null;
        let filename = '';
        let mimeType = 'application/octet-stream';

        for (const part of parts) {
            if (part.includes('filename=')) {
                const filenameMatch = part.match(/filename="([^"]+)"/);
                if (filenameMatch) filename = filenameMatch[1];

                const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
                if (contentTypeMatch) mimeType = contentTypeMatch[1].trim();

                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');
                fileData = Buffer.from(part.slice(dataStart, dataEnd), 'binary');
            }
        }

        if (!fileData || !filename) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const ext = filename.substring(filename.lastIndexOf('.'));
        const s3Key = `uploads/${uuidv4()}${ext}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileData,
            ContentType: mimeType
        }));

        const file = await File.create({
            filename: filename,
            originalName: filename,
            s3Key: s3Key,
            size: fileData.length,
            mimeType: mimeType
        });

        return res.json({
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
        return res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

// Disable body parsing for file uploads
module.exports.config = {
    api: {
        bodyParser: false
    }
};
