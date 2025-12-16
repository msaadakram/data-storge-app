const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const connectDB = require('../_lib/db');
const File = require('../_lib/models/File');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: 'File ID required' });
        }

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.s3Key
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return res.json({
            success: true,
            url: signedUrl,
            filename: file.originalName,
            mimeType: file.mimeType
        });
    } catch (error) {
        console.error('Preview error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate preview link' });
    }
};
